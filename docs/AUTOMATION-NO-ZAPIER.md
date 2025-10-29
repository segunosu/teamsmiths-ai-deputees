# AI Impact Scorecard - Full Automation with Lovable & Supabase

## 🎯 Overview

This document describes the **Zapier-free** automation system for the AI Impact Scorecard, built entirely with Lovable and Supabase.

### What's Automated:
✅ Email nurture sequences (segment-specific)  
✅ Real-time alerts for hot leads  
✅ CRM lead tracking  
✅ Conversion tracking  
✅ Dashboard analytics  

---

## 📊 Architecture

```
Scorecard Submission
        ↓
    [Database Trigger]
        ↓
   ┌────────────────┐
   │  Auto-Queue    │
   │  Nurture       │
   │  Emails        │
   └────────────────┘
        ↓
   ┌────────────────┐
   │  Trigger       │
   │  Alerts        │
   │  (Hot Leads)   │
   └────────────────┘
        ↓
   ┌────────────────┐
   │  Process       │
   │  Email Queue   │
   │  (Cron Job)    │
   └────────────────┘
```

---

## 🗄️ Database Tables

### 1. `scorecard_email_templates`
Stores email templates for each segment and day.

**Fields:**
- `segment` - Explorer, Implementer, Accelerator
- `day_number` - 0, 2, 5, 10, etc.
- `subject` - Email subject with {{variables}}
- `body_html` - HTML email body
- `cta_text` - Call-to-action button text
- `cta_url` - CTA destination URL
- `is_active` - Enable/disable template

**Pre-loaded Templates:**
- Explorer: Day 0, 2, 5, 10
- Implementer: Day 0, 1, 3, 7
- Accelerator: Day 0, 1, 3

### 2. `scorecard_email_queue`
Scheduled emails waiting to be sent.

**Fields:**
- `scorecard_id` - Reference to scorecard
- `template_id` - Which template to use
- `to_email` - Recipient
- `scheduled_for` - When to send
- `sent_at` - When it was sent
- `status` - pending, sent, failed, cancelled

### 3. `scorecard_alert_rules`
Configuration for real-time alerts.

**Fields:**
- `name` - Alert name
- `condition_segment` - Filter by segment (optional)
- `condition_min_score` - Minimum score threshold
- `alert_type` - slack, email, in_app
- `alert_target` - Webhook URL, email, or user_id
- `message_template` - Alert message with {{variables}}

**Pre-configured Rules:**
- Hot Lead Alert: Accelerator segment, score > 70
- High Score Alert: Any segment, score > 85

### 4. `scorecard_automation_log`
Audit trail of all automated actions.

**Fields:**
- `scorecard_id` - Reference
- `action_type` - email_sent, alert_sent, etc.
- `action_data` - JSON details
- `status` - success, error
- `error` - Error message if failed

---

## ⚡ How It Works

### Step 1: Scorecard Submission
When a user completes the scorecard:

1. **Save to Database**
   - Data inserted into `scorecard_responses`
   
2. **Database Trigger Fires** (automatic)
   - `trigger_queue_nurture_emails` function executes
   - Looks up all active templates for the user's segment
   - Calculates send dates (created_at + day_number)
   - Inserts rows into `scorecard_email_queue`
   
3. **Alert Function Called**
   - Frontend invokes `trigger-scorecard-alerts` edge function
   - Function checks all active alert rules
   - Sends notifications for matching conditions

### Step 2: Email Processing (Scheduled)
A cron job runs every hour to process the email queue:

**Edge Function:** `process-scorecard-emails`

**What it does:**
1. Queries `scorecard_email_queue` for pending emails where `scheduled_for <= now()`
2. For each pending email:
   - Fetches scorecard data
   - Fetches template
   - Replaces {{variables}} with actual values
   - Queues in `email_outbox` (for Resend to process)
   - Marks as `sent` in queue
3. Logs all actions to `scorecard_automation_log`

**Cron Schedule:** Every hour  
**Max batch size:** 50 emails per run

### Step 3: Alert Processing (Real-time)
When high-value leads come in:

**Edge Function:** `trigger-scorecard-alerts`

**What it does:**
1. Receives `scorecardId` from frontend
2. Fetches scorecard data
3. Checks all active alert rules
4. For each matching rule:
   - **In-app:** Creates notification in `notifications` table
   - **Slack:** Posts to webhook URL
   - **Email:** Queues in `email_outbox`
5. Logs all alerts to `scorecard_automation_log`

---

## 🔧 Setup Instructions

### Step 1: Database (Already Done ✅)
All tables and triggers are created via migrations.

### Step 2: Configure Cron Job
Add to `supabase/config.toml`:

```toml
[edge_runtime.cron]
enabled = true

[[edge_runtime.cron.jobs]]
name = "process-scorecard-emails"
schedule = "0 * * * *" # Every hour
function = "process-scorecard-emails"
```

### Step 3: Add Slack Webhook (Optional)
For Slack alerts:

1. Go to https://api.slack.com/apps
2. Create app → Incoming Webhooks
3. Copy webhook URL
4. Update alert rule in database:

```sql
UPDATE scorecard_alert_rules
SET alert_target = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
WHERE alert_type = 'slack';
```

### Step 4: Test the System
1. Submit a test scorecard
2. Check `scorecard_email_queue` - should see emails scheduled
3. Check `scorecard_automation_log` - should see queue action
4. Wait for next cron run (or manually invoke function)
5. Verify emails appear in `email_outbox`

---

## 📧 Email Nurture Workflows

### Explorer Workflow
**Goal:** Educate and invite to workshop

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Your AI Impact Score | Book Free Workshop |
| 2 | Ready to Start Your AI Journey? | Reserve Your Spot |
| 5 | Your Free AI Readiness Guide | Download Guide |
| 10 | Case Study: Getting Started | Read Case Study |

### Implementer Workflow
**Goal:** Scale pilots and accelerate growth

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Your AI Impact Score | Join Growth Sprint |
| 1 | Accelerate Your AI Growth | Learn About Sprint |
| 3 | Scaling AI in Your Organization | Access Resource |
| 7 | From Pilot to Production | Read Success Story |

### Accelerator Workflow
**Goal:** Strategic partnership and immediate engagement

| Day | Subject | CTA |
|-----|---------|-----|
| 0 | Impressive! Your AI Score | Book Strategy Call |
| 1 | Let's Drive Strategic AI Innovation | Schedule Call |
| 3 | Enterprise AI Transformation | View Case Study |

---

## 🔔 Alert Configurations

### Hot Lead Alert
**Trigger:** Accelerator segment + score > 70  
**Action:** In-app notification to admin  
**Message:** "🔥 New hot lead: {{name}} from {{company}} scored {{total_score}}/100"

### High Score Alert
**Trigger:** Any segment + score > 85  
**Action:** In-app notification to admin  
**Message:** "⭐ Exceptional score: {{name}} scored {{total_score}}/100"

### Custom Alerts
You can add more alert rules:

```sql
INSERT INTO scorecard_alert_rules (
  name,
  condition_segment,
  condition_min_score,
  alert_type,
  alert_target,
  message_template
) VALUES (
  'Slack Hot Lead Alert',
  'Accelerator',
  70,
  'slack',
  'https://hooks.slack.com/services/YOUR/WEBHOOK',
  '🔥 *New Hot Lead*\n*Name:* {{name}}\n*Company:* {{company}}\n*Score:* {{total_score}}/100'
);
```

---

## 📊 Monitoring & Analytics

### View Email Queue Status
```sql
SELECT 
  status,
  COUNT(*) as count,
  MIN(scheduled_for) as oldest_pending
FROM scorecard_email_queue
GROUP BY status;
```

### View Automation Log
```sql
SELECT 
  action_type,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
FROM scorecard_automation_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action_type;
```

### Lead Conversion Funnel
```sql
SELECT 
  segment,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN booked_session THEN 1 END) as booked,
  COUNT(CASE WHEN converted_to_project THEN 1 END) as converted
FROM scorecard_responses
GROUP BY segment;
```

---

## 🛠️ Managing Email Templates

### View Templates
```sql
SELECT segment, day_number, subject, is_active
FROM scorecard_email_templates
ORDER BY segment, day_number;
```

### Add New Template
```sql
INSERT INTO scorecard_email_templates (
  segment,
  day_number,
  subject,
  body_html,
  cta_text,
  cta_url
) VALUES (
  'Explorer',
  15,
  'Last chance to join our workshop',
  '<p>Hi {{name}},</p><p>Final reminder about our AI workshop...</p>',
  'Register Now',
  'https://teamsmiths.ai/start?interest=workshop'
);
```

### Disable Template
```sql
UPDATE scorecard_email_templates
SET is_active = false
WHERE segment = 'Explorer' AND day_number = 10;
```

### Update Template
```sql
UPDATE scorecard_email_templates
SET 
  subject = 'New subject line',
  body_html = '<p>New email body...</p>'
WHERE segment = 'Implementer' AND day_number = 1;
```

---

## 🔍 Troubleshooting

### Emails Not Sending
**Check:**
1. Is cron job running? (Check Supabase Edge Function logs)
2. Are emails in queue? `SELECT * FROM scorecard_email_queue WHERE status = 'pending'`
3. Is `scheduled_for` in the past?
4. Check `email_outbox` table for queued emails
5. Verify Resend API key is configured

**Manual trigger:**
```bash
curl -X POST "https://iyqsbjawaampgcavsgcz.supabase.co/functions/v1/process-scorecard-emails" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Alerts Not Firing
**Check:**
1. Alert rules are active: `SELECT * FROM scorecard_alert_rules WHERE is_active = true`
2. Conditions match: Verify segment and score thresholds
3. Check automation log: `SELECT * FROM scorecard_automation_log WHERE action_type LIKE 'alert%'`
4. For Slack: Test webhook URL manually

### Templates Not Loading
**Check:**
1. Templates exist: `SELECT COUNT(*) FROM scorecard_email_templates`
2. Templates are active: `WHERE is_active = true`
3. Segment matches exactly: Case-sensitive ('Explorer' not 'explorer')

---

## 🎨 Customization

### Change Email Frequency
Adjust `day_number` in templates or add/remove templates.

### Add Custom Variables
Available variables in templates:
- `{{name}}` - Lead name
- `{{email}}` - Lead email
- `{{company}}` - Company name
- `{{total_score}}` - Total score
- `{{readiness_score}}` - Readiness dimension
- `{{reach_score}}` - Reach dimension
- `{{prowess_score}}` - Prowess dimension
- `{{protection_score}}` - Protection dimension
- `{{segment}}` - Explorer/Implementer/Accelerator

### A/B Testing
Create multiple templates for same day:
1. Duplicate template with different content
2. Set one to `is_active = true`
3. Monitor conversion rates
4. Switch to better performer

---

## 📈 Success Metrics

### Track These KPIs:
1. **Email Delivery Rate:** sent / queued
2. **Open Rate:** (requires email tracking integration)
3. **Click-Through Rate:** Track CTA clicks
4. **Booking Rate:** `booked_session = true` / total leads
5. **Conversion Rate:** `converted_to_project = true` / total leads
6. **Segment Performance:** Conversion rate by segment
7. **Email Sequence Performance:** Which day/email converts best

### Query for Metrics:
```sql
-- Overall conversion rate
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN booked_session THEN 1 END) as booked,
  ROUND(100.0 * COUNT(CASE WHEN booked_session THEN 1 END) / COUNT(*), 2) as booking_rate,
  COUNT(CASE WHEN converted_to_project THEN 1 END) as converted,
  ROUND(100.0 * COUNT(CASE WHEN converted_to_project THEN 1 END) / COUNT(*), 2) as conversion_rate
FROM scorecard_responses;
```

---

## 🚀 Future Enhancements

### Phase 3 Ideas:
- [ ] SMS notifications for high-value leads
- [ ] Dynamic content based on specific 4RPR scores
- [ ] Email open/click tracking
- [ ] A/B testing framework
- [ ] Predictive lead scoring with AI
- [ ] WhatsApp integration for Accelerator segment
- [ ] Auto-assignment to sales reps based on rules
- [ ] Calendar booking automation
- [ ] CRM two-way sync

---

## 📚 Related Documentation

- [CRM Integration Guide](./CRM-INTEGRATION-GUIDE.md)
- [Lovable CRM Instructions](./LOVABLE-CRM-INSTRUCTIONS.md)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)

---

**Questions?** Check the automation log or contact the dev team.

**Last Updated:** January 2025  
**Version:** 2.0 (Zapier-Free)
