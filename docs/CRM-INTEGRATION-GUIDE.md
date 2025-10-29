# AI Impact Scorecard - CRM Integration Guide

## Overview
This guide explains how to integrate the AI Impact Scorecard leads into your Teamsmiths CRM system.

## Architecture

### Database Connection (Recommended)
Both projects use Supabase. The scorecard data is stored in the `scorecard_responses` table.

**Option 1: Shared Database** (If same Supabase project)
- The CRM can directly query the `scorecard_responses` table
- Use the `scorecard_leads_view` for simplified access

**Option 2: Cross-Project API** (If different Supabase projects)  
- Use the `scorecard-webhook` edge function
- API endpoint: `https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook`

**Option 3: Zapier Integration**
- Set up Zapier webhook triggers
- Connect to CRM automation workflows

## Data Structure

### Scorecard Response Fields
```typescript
{
  id: uuid,                    // Unique scorecard ID
  lead_id: uuid,              // Lead reference ID
  user_id: uuid,              // User ID (if authenticated)
  name: string,               // Contact name
  email: string,              // Contact email
  company: string,            // Company name
  role: string,               // Job role
  
  // Scores
  total_score: number,        // 0-100
  readiness_score: number,    // 0-100
  reach_score: number,        // 0-100
  prowess_score: number,      // 0-100
  protection_score: number,   // 0-100
  
  // Segmentation
  segment: 'Explorer' | 'Implementer' | 'Accelerator',
  
  // Tracking
  source: string,             // Origin source
  utm_source: string,
  utm_medium: string,
  utm_campaign: string,
  
  // CRM Fields
  crm_lead_status: string,    // 'new', 'contacted', 'qualified', 'converted'
  crm_synced_at: timestamp,
  last_contacted_at: timestamp,
  booked_session: boolean,
  converted_to_project: boolean,
  notes: text,
  
  created_at: timestamp,
  updated_at: timestamp
}
```

## Integration Methods

### Method 1: Direct Database Query (Same Supabase Project)

**Step 1: In CRM Project - Add Database Connection**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iyqsbjawaampgcavsgcz.supabase.co',
  'YOUR_ANON_KEY'
);
```

**Step 2: Query Scorecard Leads**
```typescript
// Fetch all new leads
const { data: leads } = await supabase
  .from('scorecard_leads_view')
  .select('*')
  .eq('crm_lead_status', 'new')
  .order('created_at', { ascending: false });

// Filter by segment
const { data: explorers } = await supabase
  .from('scorecard_leads_view')
  .select('*')
  .eq('segment', 'Explorer')
  .is('crm_synced_at', null);
```

**Step 3: Update Lead Status**
```typescript
await supabase
  .from('scorecard_responses')
  .update({
    crm_lead_status: 'contacted',
    crm_synced_at: new Date().toISOString(),
    last_contacted_at: new Date().toISOString()
  })
  .eq('id', leadId);
```

---

### Method 2: API Webhook (Cross-Project or External CRM)

**Base URL:** `https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook`

**Authentication:** Include Supabase anon key in header
```
Authorization: Bearer YOUR_ANON_KEY
```

#### GET - Fetch Leads
```bash
# Get all new leads
curl "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook?status=new" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get leads since specific date
curl "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook?since=2025-01-01" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get by segment
curl "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook?segment=Accelerator" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### POST - Update Single Lead
```bash
curl -X POST "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "uuid-here",
    "updates": {
      "crm_lead_status": "contacted",
      "last_contacted_at": "2025-01-29T10:00:00Z",
      "notes": "Called and left voicemail"
    }
  }'
```

#### PUT - Bulk Update
```bash
curl -X PUT "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "lead_id": "uuid-1",
        "crm_lead_status": "contacted",
        "crm_synced_at": "2025-01-29T10:00:00Z"
      },
      {
        "lead_id": "uuid-2",
        "crm_lead_status": "qualified",
        "booked_session": true
      }
    ]
  }'
```

---

### Method 3: Zapier Integration

**Step 1: Create Zapier Account & Zap**
1. Go to zapier.com
2. Create new Zap
3. Choose trigger: "Webhooks by Zapier" > "Catch Hook"

**Step 2: Set Up Supabase Trigger (Alternative)**
1. Use "Supabase" app in Zapier
2. Trigger: "New Row" in table `scorecard_responses`
3. Connect your Supabase account

**Step 3: Add Filters**
- Filter by segment (Explorer/Implementer/Accelerator)
- Filter by score range
- Filter by source/UTM parameters

**Step 4: Create Action Based on Segment**

**For Explorer Segment:**
- Action: Send email with workshop invitation
- Action: Add to "Explorer Nurture" sequence
- Action: Tag in CRM as "Explorer"

**For Implementer Segment:**
- Action: Send email with Growth Sprint invitation
- Action: Add to "Implementer Nurture" sequence
- Action: Create task for sales follow-up

**For Accelerator Segment:**
- Action: Send Slack notification to team
- Action: Create high-priority lead in CRM
- Action: Send immediate booking link email
- Action: Assign to account executive

**Step 5: Update CRM Status**
Use Zapier's "Code" action or HTTP request to call back to webhook:
```javascript
// Zapier Code Action
const response = await fetch('https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lead_id: inputData.id,
    updates: {
      crm_lead_status: 'contacted',
      crm_synced_at: new Date().toISOString()
    }
  })
});
```

---

## CRM Dashboard Implementation

### For Teamsmiths CRM (Lovable Project)

**Step 1: Create Scorecard Leads Page**
```tsx
// src/pages/ScorecardLeads.tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ScorecardLeads = () => {
  const { data: leads } = useQuery({
    queryKey: ['scorecard-leads'],
    queryFn: async () => {
      const { data } = await supabase
        .from('scorecard_leads_view')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1>Scorecard Leads</h1>
      {/* Render leads in table/cards */}
    </div>
  );
};
```

**Step 2: Add Segmentation Tabs**
- Tab 1: All Leads
- Tab 2: Explorers (new leads, low maturity)
- Tab 3: Implementers (medium maturity)
- Tab 4: Accelerators (high maturity, hot leads)

**Step 3: Add Filters**
- Date range
- Score range
- Status (new, contacted, qualified, converted)
- Source/UTM parameters

**Step 4: Add Actions**
- Mark as contacted
- Add notes
- Book session
- Convert to project
- Send email

**Step 5: Dashboard KPIs**
```tsx
const { data: stats } = useQuery({
  queryKey: ['scorecard-stats'],
  queryFn: async () => {
    const { data: total } = await supabase
      .from('scorecard_responses')
      .select('count');
    
    const { data: bySegment } = await supabase
      .from('scorecard_responses')
      .select('segment, count');
    
    const { data: conversions } = await supabase
      .from('scorecard_responses')
      .select('count')
      .eq('converted_to_project', true);
      
    return { total, bySegment, conversions };
  }
});
```

---

## Lead Nurture Workflows

### Explorer Workflow
**Day 0:** Welcome email + scorecard results (automated)
**Day 2:** Workshop invitation email
**Day 5:** AI readiness guide PDF
**Day 10:** Case study: "Getting Started with AI"
**Day 15:** Follow-up: "Ready to start your AI journey?"

### Implementer Workflow  
**Day 0:** Welcome email + scorecard results (automated)
**Day 1:** Growth Sprint invitation
**Day 3:** Resource: "Scaling AI in Your Organization"
**Day 7:** Success story: "From Pilot to Production"
**Day 10:** Call booking reminder
**Day 14:** Follow-up: "Let's accelerate your AI progress"

### Accelerator Workflow
**Day 0:** Immediate notification to sales team (automated)
**Day 0:** Premium email + calendar booking link
**Day 1:** Personal video from founder/expert
**Day 2:** Phone call attempt (task for team)
**Day 3:** Case study: "Enterprise AI Transformation"
**Day 5:** Follow-up call attempt
**Day 7:** Strategic partnership proposal

---

## Notification Setup

### Slack Notifications (High-Intent Leads)
Create Zapier Zap:
1. Trigger: New row in `scorecard_responses` where segment = "Accelerator"
2. Filter: total_score > 70
3. Action: Send Slack message to #hot-leads channel

Message template:
```
🔥 New Hot Lead: Accelerator Segment

Name: {{name}}
Email: {{email}}
Company: {{company}}
Score: {{total_score}}/100

Segment: {{segment}}
Source: {{source}}

📊 Breakdown:
- Readiness: {{readiness_score}}
- Reach: {{reach_score}}
- Prowess: {{prowess_score}}  
- Protection: {{protection_score}}

🎯 Action: Book call immediately
👉 View in CRM: [link to CRM]
```

---

## Email Nurture Sequences

### Setting Up Email Templates

**Tool Options:**
- Resend (already configured in project)
- Zapier Email
- Mailchimp
- HubSpot

**Template Variables:**
- {{name}}
- {{segment}}
- {{total_score}}
- {{company}}
- {{cta_url}}

### Sample Email: Explorer Day 0
```
Subject: Your AI Impact Score: {{total_score}}/100 🎯

Hi {{name}},

Thanks for taking the AI Impact Scorecard! Your score places you in the **Explorer** segment - you're at the beginning of an exciting AI journey.

📊 Your Breakdown:
- Readiness: {{readiness_score}}
- Reach: {{reach_score}}
- Prowess: {{prowess_score}}
- Protection: {{protection_score}}

🎯 Next Step: Join our free AI Workshop
Learn the fundamentals and identify your first AI use cases.

[Book Workshop] {{cta_url}}

Best regards,
Teamsmiths Team
```

---

## Conversion Tracking

### Tracking Events to Record

1. **Workshop Booked** - Set `booked_session = true`
2. **Workshop Attended** - Update `crm_lead_status = 'engaged'`
3. **Sprint Signup** - Update `crm_lead_status = 'qualified'`
4. **Project Created** - Set `converted_to_project = true`
5. **Payment Received** - Update to `crm_lead_status = 'customer'`

### Implementation in CRM
```typescript
// When user books workshop
await supabase
  .from('scorecard_responses')
  .update({
    booked_session: true,
    last_contacted_at: new Date().toISOString(),
    crm_lead_status: 'engaged'
  })
  .eq('email', userEmail);

// When project created
await supabase
  .from('scorecard_responses')
  .update({
    converted_to_project: true,
    crm_lead_status: 'customer'
  })
  .eq('email', userEmail);
```

---

## Metrics Dashboard

### Key Metrics to Track

**Lead Volume:**
- Total scorecard completions
- Completions by segment
- Completions by source/UTM
- Daily/weekly/monthly trends

**Conversion Funnel:**
- Scorecard → Email opened (track in email tool)
- Email → Session booked
- Session booked → Session attended
- Session → Sprint signup
- Sprint → Project created
- Project → Payment

**Segment Performance:**
- Explorer conversion rate
- Implementer conversion rate  
- Accelerator conversion rate
- Average time to conversion by segment

**Revenue Metrics:**
- Total pipeline value from scorecard leads
- Conversion to revenue by segment
- Average deal size by segment
- ROI of scorecard campaign

### Dashboard Queries
```typescript
// Conversion rates by segment
const conversionRates = await supabase
  .rpc('calculate_segment_conversions');

// Lead velocity (leads per day)
const leadVelocity = await supabase
  .from('scorecard_responses')
  .select('created_at')
  .gte('created_at', thirtyDaysAgo)
  .then(data => data.length / 30);
```

---

## Testing Checklist

- [ ] New scorecard submission creates lead in CRM
- [ ] Lead is correctly segmented (Explorer/Implementer/Accelerator)
- [ ] Segment-specific email is triggered
- [ ] Slack notification sent for Accelerator leads (score > 70)
- [ ] CRM dashboard shows new lead
- [ ] UTM parameters are captured correctly
- [ ] Lead status can be updated from CRM
- [ ] Booking link triggers status update
- [ ] Conversion tracking works end-to-end
- [ ] All emails have working CTAs
- [ ] Zapier workflows are active and not paused
- [ ] Dashboard metrics are calculating correctly

---

## Troubleshooting

**Issue: Leads not appearing in CRM**
- Check Supabase connection
- Verify RLS policies allow reading scorecard_responses
- Check if lead_id is being generated

**Issue: Zapier not triggering**
- Verify webhook URL is correct
- Check Zapier task history for errors
- Ensure Supabase table trigger is set up correctly

**Issue: Wrong segment assignment**
- Check scoring algorithm in ScorecardQuiz.tsx
- Verify segment thresholds are correct
- Review test submissions

**Issue: Emails not sending**
- Check Resend API key is configured
- Verify email_outbox processing
- Check spam folder

---

## Next Steps

1. **Choose Integration Method** (Direct DB, API, or Zapier)
2. **Set up CRM Dashboard** in Lovable CRM project
3. **Configure Zapier Workflows** for each segment
4. **Create Email Templates** for nurture sequences
5. **Set up Slack Notifications** for hot leads
6. **Test End-to-End** with sample submissions
7. **Monitor and Optimize** based on conversion data

---

## Support Resources

- **Scorecard Database:** `scorecard_responses` table
- **View:** `scorecard_leads_view` (simplified access)
- **Webhook:** `scorecard-webhook` edge function
- **Supabase Project:** https://iyqsbjawaampgcavsgcz.supabase.co
- **CRM Project:** https://lovable.dev/projects/60b7bde4-08fc-4a6a-a5c4-a9e917ed8fb9

---

**Last Updated:** January 2025  
**Version:** 1.0
