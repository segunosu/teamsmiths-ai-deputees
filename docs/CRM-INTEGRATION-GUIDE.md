# AI Impact Scorecard - CRM Integration Guide

## Overview
This guide explains how to integrate the AI Impact Scorecard leads into your Teamsmiths CRM system using **only Lovable and Supabase** (no Zapier needed).

## 🎯 What's Automated Out of the Box

✅ **Email Nurture Sequences** - Segment-specific emails automatically queued  
✅ **Real-Time Alerts** - Hot leads trigger instant notifications  
✅ **CRM Tracking** - All leads captured with full metadata  
✅ **Conversion Tracking** - Monitor bookings and project conversions  
✅ **Analytics Dashboard** - Real-time metrics and insights  

---

## Architecture

### Automation Flow
```
User Completes Scorecard
         ↓
   [Insert to DB]
         ↓
   [Database Trigger] ← Automatic
         ↓
   Queue Nurture Emails (Day 0, 2, 5, 10...)
         ↓
   Trigger Alerts (if high-value lead)
         ↓
   [Cron Job] ← Runs hourly
         ↓
   Process & Send Emails
```

### Database Connection
Both projects use Supabase. The scorecard data is in the `scorecard_responses` table with supporting automation tables.

---

## Data Structure

### Main Tables

#### `scorecard_responses`
Primary lead data:
```typescript
{
  id: uuid,
  lead_id: uuid,
  user_id: uuid,
  name: string,
  email: string,
  company: string,
  role: string,
  
  // Scores
  total_score: number,        // 0-100
  readiness_score: number,
  reach_score: number,
  prowess_score: number,
  protection_score: number,
  
  // Segmentation
  segment: 'Explorer' | 'Implementer' | 'Accelerator',
  
  // Tracking
  source: string,
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

#### `scorecard_email_queue`
Scheduled nurture emails:
```typescript
{
  id: uuid,
  scorecard_id: uuid,
  template_id: uuid,
  to_email: string,
  scheduled_for: timestamp,
  sent_at: timestamp,
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
}
```

#### `scorecard_email_templates`
Email content by segment:
```typescript
{
  id: uuid,
  segment: string,
  day_number: integer,        // 0, 2, 5, 10, etc.
  subject: string,
  body_html: string,
  cta_text: string,
  cta_url: string,
  is_active: boolean
}
```

#### `scorecard_alert_rules`
Real-time notification config:
```typescript
{
  id: uuid,
  name: string,
  condition_segment: string,  // null = all
  condition_min_score: integer,
  alert_type: 'slack' | 'email' | 'in_app',
  alert_target: string,       // webhook URL, email, or user_id
  message_template: string,
  is_active: boolean
}
```

---

## Integration Methods

### Method 1: Direct Database Query (Recommended)

**Step 1: Configure Supabase Client in CRM**
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
const { data: accelerators } = await supabase
  .from('scorecard_leads_view')
  .select('*')
  .eq('segment', 'Accelerator')
  .gte('total_score', 70);
```

**Step 3: Update Lead Status**
```typescript
await supabase
  .from('scorecard_responses')
  .update({
    crm_lead_status: 'contacted',
    last_contacted_at: new Date().toISOString()
  })
  .eq('id', leadId);
```

---

### Method 2: API Webhook (Cross-Project or External)

**Base URL:** `https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook`

#### GET - Fetch Leads
```bash
# Get hot leads
curl "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook?segment=Accelerator&status=new" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get leads since date
curl "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/scorecard-webhook?since=2025-01-01" \
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
      "notes": "Called and left voicemail"
    }
  }'
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
      {/* Render leads */}
    </div>
  );
};
```

**Step 2: Real-Time Notifications**
```tsx
useEffect(() => {
  const channel = supabase
    .channel('scorecard-leads')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'scorecard_responses',
      filter: 'segment=eq.Accelerator'
    }, (payload) => {
      toast.success(`🔥 New hot lead: ${payload.new.name}`);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**Step 3: Dashboard KPIs**
```tsx
const { data: stats } = useQuery({
  queryKey: ['scorecard-stats'],
  queryFn: async () => {
    const { data } = await supabase
      .from('scorecard_responses')
      .select('segment, crm_lead_status, booked_session, converted_to_project');
    
    return {
      total: data?.length || 0,
      bySegment: groupBy(data, 'segment'),
      booked: data?.filter(d => d.booked_session).length || 0,
      converted: data?.filter(d => d.converted_to_project).length || 0
    };
  }
});
```

---

## Lead Nurture Workflows

All automated via database triggers and cron jobs. No manual configuration needed!

### Explorer Workflow
**Goal:** Educate and invite to workshop

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Your AI Impact Score: {{total_score}}/100 🎯 | Book Free Workshop |
| 2 | Ready to Start Your AI Journey? | Reserve Your Spot |
| 5 | Your Free AI Readiness Guide | Download Guide |
| 10 | Case Study: Getting Started with AI | Read Case Study |

### Implementer Workflow
**Goal:** Scale pilots and accelerate growth

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Your AI Impact Score: {{total_score}}/100 🚀 | Join Growth Sprint |
| 1 | Accelerate Your AI Growth | Learn About Sprint |
| 3 | Scaling AI in Your Organization | Access Resource |
| 7 | From Pilot to Production Success Story | Read Success Story |

### Accelerator Workflow
**Goal:** Strategic partnership and immediate engagement

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Impressive! Your AI Score: {{total_score}}/100 🏆 | Book Strategy Call |
| 1 | Let's Drive Strategic AI Innovation | Schedule Call |
| 3 | Enterprise AI Transformation Case Study | View Case Study |

**How It Works:**
1. User completes scorecard
2. Database trigger auto-queues all emails for their segment
3. Cron job processes queue hourly
4. Emails sent via Resend
5. Opens/clicks tracked automatically

---

## Alert Configurations

### Pre-Configured Alerts

1. **Hot Lead Alert**
   - Trigger: Accelerator + score > 70
   - Action: In-app notification
   - Message: "🔥 New hot lead: {{name}} from {{company}} scored {{total_score}}/100"

2. **High Score Alert**
   - Trigger: Any segment + score > 85
   - Action: In-app notification
   - Message: "⭐ Exceptional score: {{name}} scored {{total_score}}/100"

### Add Slack Alerts

1. Create Slack Incoming Webhook at https://api.slack.com/apps
2. Update alert rule:

```sql
INSERT INTO scorecard_alert_rules (
  name,
  condition_segment,
  condition_min_score,
  alert_type,
  alert_target,
  message_template
) VALUES (
  'Slack Hot Lead',
  'Accelerator',
  70,
  'slack',
  'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  '🔥 *New Hot Lead*\n*Name:* {{name}}\n*Company:* {{company}}\n*Score:* {{total_score}}/100'
);
```

---

## Conversion Tracking

### Track These Events

1. **Workshop Booked**
```typescript
await supabase
  .from('scorecard_responses')
  .update({
    booked_session: true,
    crm_lead_status: 'engaged',
    last_contacted_at: new Date().toISOString()
  })
  .eq('email', userEmail);
```

2. **Project Created**
```typescript
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
```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  segment,
  COUNT(*) as leads
FROM scorecard_responses
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date, segment
ORDER BY date DESC;
```

**Conversion Funnel:**
```sql
SELECT 
  segment,
  COUNT(*) as total,
  COUNT(CASE WHEN booked_session THEN 1 END) as booked,
  COUNT(CASE WHEN converted_to_project THEN 1 END) as converted,
  ROUND(100.0 * COUNT(CASE WHEN booked_session THEN 1 END) / COUNT(*), 2) as booking_rate,
  ROUND(100.0 * COUNT(CASE WHEN converted_to_project THEN 1 END) / COUNT(*), 2) as conversion_rate
FROM scorecard_responses
GROUP BY segment;
```

**Email Performance:**
```sql
SELECT 
  t.segment,
  t.day_number,
  COUNT(*) as queued,
  COUNT(CASE WHEN q.status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN q.status = 'failed' THEN 1 END) as failed
FROM scorecard_email_queue q
JOIN scorecard_email_templates t ON t.id = q.template_id
GROUP BY t.segment, t.day_number
ORDER BY t.segment, t.day_number;
```

---

## Testing Checklist

- [ ] New scorecard submission creates lead in database
- [ ] Lead is correctly segmented
- [ ] Emails are queued automatically with correct dates
- [ ] Alert triggers for Accelerator leads with score > 70
- [ ] CRM dashboard shows new lead in real-time
- [ ] UTM parameters captured correctly
- [ ] Lead status can be updated from CRM
- [ ] Email templates render with correct variable replacements
- [ ] Cron job processes emails hourly
- [ ] Conversion tracking updates database

---

## Troubleshooting

**Issue: Emails not queuing**
- Check `scorecard_email_queue` table
- Verify database trigger is active
- Check `scorecard_automation_log` for errors

**Issue: Alerts not firing**
- Verify alert rules are active
- Check segment and score match conditions
- Review `scorecard_automation_log`

**Issue: Cron job not running**
- Check Supabase Edge Function logs
- Verify cron schedule in `config.toml`
- Manually trigger: `curl -X POST <function-url>`

---

## Next Steps

1. **Set up CRM Dashboard** (see `LOVABLE-CRM-INSTRUCTIONS.md`)
2. **Configure Slack Webhooks** (optional)
3. **Customize Email Templates** (optional)
4. **Monitor Automation Logs**
5. **Track Conversion Metrics**

---

## Support Resources

- **Automation Guide:** `AUTOMATION-NO-ZAPIER.md`
- **CRM Instructions:** `LOVABLE-CRM-INSTRUCTIONS.md`
- **Supabase Project:** https://iyqsbjawaampgcavsgcz.supabase.co
- **CRM Project:** https://lovable.dev/projects/60b7bde4-08fc-4a6a-a5c4-a9e917ed8fb9

---

**Last Updated:** January 2025  
**Version:** 2.0 (Fully Automated - No Zapier)
