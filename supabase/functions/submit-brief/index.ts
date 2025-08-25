import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Create client with anon key for user operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { 
      contact_name, 
      contact_email, 
      contact_phone, 
      structured_brief, 
      proposal_json,
      assured_mode,
      origin,
      origin_id 
    } = await req.json()

    console.log('Submitting brief:', { contact_email, origin, origin_id })

    if (!contact_email || !structured_brief) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: contact_email, structured_brief' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get current user if authenticated
    const authHeader = req.headers.get('Authorization')
    let currentUser = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data } = await supabaseClient.auth.getUser(token)
      currentUser = data.user
    }

    // Check for existing user with this email
    const { data: existingUsers, error: userLookupError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', contact_email.toLowerCase())
      .limit(1)

    if (userLookupError) {
      console.error('Error looking up user:', userLookupError)
    }

    let userId = currentUser?.id || null
    let orgId = null

    // If user exists, use their ID
    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id
      
      // Get user's org if they have one
      const { data: userOrgs } = await supabaseAdmin
        .from('user_orgs')
        .select('org_id')
        .eq('user_id', userId)
        .limit(1)
      
      if (userOrgs && userOrgs.length > 0) {
        orgId = userOrgs[0].org_id
      }
    } else if (!currentUser) {
      // Create a new user record
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: contact_email.toLowerCase(),
          name: contact_name
        }])
        .select()
        .single()

      if (createUserError) {
        console.error('Error creating user:', createUserError)
      } else if (newUser) {
        userId = newUser.id
        console.log('Created new user:', newUser.id)
      }
    }

    // Check for duplicate briefs within 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: existingBriefs } = await supabaseAdmin
      .from('briefs')
      .select('id')
      .eq('contact_email', contact_email.toLowerCase())
      .gte('created_at', fifteenMinutesAgo)
      .in('status', ['draft', 'submitted'])
      .limit(1)

    let briefId
    if (existingBriefs && existingBriefs.length > 0) {
      // Update existing brief
      briefId = existingBriefs[0].id
      const { error: updateError } = await supabaseAdmin
        .from('briefs')
        .update({
          contact_name,
          contact_phone,
          structured_brief,
          proposal_json,
          assured_mode: assured_mode || false,
          status: 'submitted',
          user_id: userId,
          org_id: orgId
        })
        .eq('id', briefId)

      if (updateError) {
        console.error('Error updating brief:', updateError)
        throw updateError
      }
      console.log('Updated existing brief:', briefId)
    } else {
      // Create new brief
      const { data: newBrief, error: briefError } = await supabaseAdmin
        .from('briefs')
        .insert([{
          origin: origin || 'bespoke',
          origin_id,
          contact_name,
          contact_email: contact_email.toLowerCase(),
          contact_phone,
          structured_brief,
          proposal_json,
          assured_mode: assured_mode || false,
          status: 'submitted',
          user_id: userId,
          org_id: orgId
        }])
        .select()
        .single()

      if (briefError) {
        console.error('Error creating brief:', briefError)
        throw briefError
      }

      briefId = newBrief.id
      console.log('Created new brief:', briefId)
    }

    // Create brief event
    const { error: eventError } = await supabaseAdmin
      .from('brief_events')
      .insert([{
        brief_id: briefId,
        type: 'submitted',
        payload: {
          origin,
          origin_id,
          assured_mode: assured_mode || false
        }
      }])

    if (eventError) {
      console.error('Error creating brief event:', eventError)
    }

    // TODO: Send acknowledgment email
    // TODO: Send Slack notification
    // TODO: Run matching algorithm

    return new Response(
      JSON.stringify({ 
        brief_id: briefId,
        status: 'submitted',
        message: 'Brief submitted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Brief submission error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to submit brief', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})