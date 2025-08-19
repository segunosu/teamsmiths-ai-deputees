import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { message, sessionId, projectId } = await req.json();
    logStep("Request parsed", { sessionId, projectId, messageLength: message?.length });

    // Get or create chat session
    let session;
    if (sessionId) {
      const { data: existingSession } = await supabaseClient
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      session = existingSession;
    } else {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: message.substring(0, 50) + '...'
        })
        .select()
        .single();
      
      if (sessionError) throw new Error(`Session creation failed: ${sessionError.message}`);
      session = newSession;
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabaseClient
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(20);

    // Get project context
    const { data: project } = await supabaseClient
      .from('projects')
      .select('title, status, total_price, currency')
      .eq('id', projectId)
      .single();

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are TeamSmith AI, an intelligent project management assistant. You help users manage their projects, provide insights, and answer questions.

Project Context:
- Title: ${project?.title || 'Unknown'}
- Status: ${project?.status || 'Unknown'}
- Budget: ${project?.total_price || 'N/A'} ${project?.currency || ''}

You can help with:
- Project planning and milestone tracking
- Resource allocation suggestions
- Risk assessment and mitigation
- Timeline optimization
- Budget analysis
- Team coordination advice

Be helpful, professional, and provide actionable insights.`
      },
      ...(recentMessages || []),
      { role: 'user', content: message }
    ];

    logStep("Calling OpenAI API", { messageCount: messages.length });

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages,
        max_completion_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logStep("OpenAI API error", { status: response.status, error: errorData });
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    logStep("OpenAI response received", { responseLength: aiMessage.length });

    // Save messages to database
    await supabaseClient.from('chat_messages').insert([
      {
        session_id: session.id,
        role: 'user',
        content: message
      },
      {
        session_id: session.id,
        role: 'assistant',
        content: aiMessage
      }
    ]);

    // Generate project insights if this is a new conversation
    if (!sessionId) {
      try {
        const insightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-mini-2025-08-07',
            messages: [
              {
                role: 'system',
                content: `Analyze this project conversation and generate 2-3 actionable insights. Focus on:
- Potential risks or bottlenecks
- Optimization opportunities
- Resource allocation improvements
- Timeline considerations

Return JSON format: {"insights": [{"type": "risk|opportunity|optimization", "title": "Brief title", "content": "Detailed insight", "confidence": 0.8}]}`
              },
              { role: 'user', content: `Project: ${project?.title}\nUser question: ${message}\nAI response: ${aiMessage}` }
            ],
            max_completion_tokens: 500
          }),
        });

        if (insightResponse.ok) {
          const insightData = await insightResponse.json();
          const insights = JSON.parse(insightData.choices[0].message.content);
          
          for (const insight of insights.insights) {
            await supabaseClient.from('project_insights').insert({
              project_id: projectId,
              insight_type: insight.type,
              title: insight.title,
              content: insight.content,
              confidence_score: insight.confidence
            });
          }
        }
      } catch (error) {
        logStep("Insight generation failed", { error: error.message });
      }
    }

    return new Response(JSON.stringify({
      message: aiMessage,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-chat", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});