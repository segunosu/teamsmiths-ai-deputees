# Instructions for Lovable CRM - Scorecard Integration

Copy and paste these instructions into your Teamsmiths CRM Lovable project (https://lovable.dev/projects/60b7bde4-08fc-4a6a-a5c4-a9e917ed8fb9):

---

## Phase 1: Database Connection

**Instruction 1:**
```
Connect to the existing Supabase database that stores scorecard leads.

Database Details:
- Supabase URL: https://iyqsbjawaampgcavsgcz.supabase.co
- Table: scorecard_responses
- View: scorecard_leads_view (simplified access)

The table contains these key fields:
- id, name, email, company, role
- total_score, readiness_score, reach_score, prowess_score, protection_score
- segment (Explorer/Implementer/Accelerator)
- crm_lead_status, last_contacted_at, booked_session, converted_to_project
- source, utm_source, utm_medium, utm_campaign
- created_at, updated_at

Create a Supabase client connection to this database.
```

---

## Phase 2: Create Scorecard Leads Dashboard

**Instruction 2:**
```
Create a new page at /scorecard-leads for admin users only.

The page should display leads from the scorecard_leads_view in a table/card layout with:

1. **Header with KPIs:**
   - Total Leads (count)
   - New Leads (crm_lead_status = 'new')
   - Booked Sessions (booked_session = true)
   - Converted to Projects (converted_to_project = true)

2. **Segmentation Tabs:**
   - All Leads
   - Explorers (segment = 'Explorer')
   - Implementers (segment = 'Implementer')
   - Accelerators (segment = 'Accelerator')

3. **Filters:**
   - Date range picker
   - Score range slider (0-100)
   - Status dropdown (new, contacted, qualified, converted)
   - Source/UTM filters

4. **Lead Cards/Table showing:**
   - Name, Email, Company, Role
   - Total Score with color coding (red <40, yellow 40-70, green >70)
   - Segment badge with appropriate colors
   - 4RPR scores mini chart
   - Created date
   - Current status
   - Quick actions (contact, add note, mark booked)

5. **Sorting:** by date, score, segment, status

Use Tanstack Query for data fetching and Shadcn components for UI.
```

---

## Phase 3: Lead Detail View

**Instruction 3:**
```
Create a lead detail modal/page that opens when clicking a lead.

Show:
1. **Contact Info:** name, email, company, role
2. **Score Breakdown:** 
   - Total score with large display
   - Individual 4RPR scores with progress bars
   - Segment badge
3. **Activity Timeline:**
   - Scorecard completed
   - Status changes
   - Notes added
   - Sessions booked
   - Emails sent
4. **Actions:**
   - Update status dropdown
   - Add notes textarea
   - Mark as contacted button
   - Mark session booked button
   - Mark converted to project button
   - Send email button
5. **UTM Data:** source, medium, campaign

All updates should write back to the scorecard_responses table.
```

---

## Phase 4: Status Update Functions

**Instruction 4:**
```
Create these action functions:

1. **updateLeadStatus(leadId, status):**
   - Updates crm_lead_status field
   - Adds timestamp to last_contacted_at
   - Shows success toast

2. **addLeadNote(leadId, note):**
   - Appends to notes field
   - Includes timestamp and user
   - Shows confirmation

3. **markSessionBooked(leadId):**
   - Sets booked_session = true
   - Updates crm_lead_status to 'engaged'
   - Records timestamp

4. **markConverted(leadId):**
   - Sets converted_to_project = true
   - Updates crm_lead_status to 'customer'
   - Shows celebration animation

Use optimistic updates and proper error handling.
```

---

## Phase 5: Dashboard Charts

**Instruction 5:**
```
Add a dashboard section with these charts using Recharts:

1. **Lead Volume Chart:** Line chart showing leads per day for last 30 days
2. **Segment Distribution:** Pie chart of Explorer/Implementer/Accelerator split
3. **Conversion Funnel:** Bar chart showing:
   - Total Leads
   - Contacted
   - Booked Session
   - Converted to Project
4. **Score Distribution:** Histogram of score ranges (0-20, 21-40, 41-60, 61-80, 81-100)
5. **Source Performance:** Bar chart showing leads by UTM source

All charts should update based on the current filters.
```

---

## Phase 6: Notifications

**Instruction 6:**
```
Add a notification system for new high-intent leads:

1. Create a real-time subscription to scorecard_responses table
2. Show toast notification when:
   - New lead arrives with segment = 'Accelerator'
   - New lead with score > 70
3. Notification should show:
   - Name, Company
   - Score
   - "View Lead" button
4. Play a subtle notification sound
5. Show badge count on sidebar

Use Supabase real-time subscriptions.
```

---

## Phase 7: Bulk Actions

**Instruction 7:**
```
Add bulk action capabilities:

1. Checkbox selection for multiple leads
2. Bulk actions toolbar appears when leads selected:
   - Mark as Contacted
   - Assign to User
   - Change Status
   - Export to CSV
   - Send Bulk Email

3. Confirmation dialog before bulk actions
4. Progress indicator during bulk updates
5. Summary of results after completion

Use Promise.all for parallel updates.
```

---

## Phase 8: Export & Reporting

**Instruction 8:**
```
Add export functionality:

1. **Export to CSV button** that downloads:
   - All filtered leads with all fields
   - Formatted dates
   - Human-readable segment names

2. **Weekly Email Report** (future automation):
   - New leads this week
   - Conversion stats
   - Top performing sources
   - Segment breakdown

3. **Conversion Report:** showing full funnel metrics
```

---

## Phase 9: Integration with Existing CRM

**Instruction 9:**
```
Link scorecard leads to existing CRM records:

1. When viewing a lead, show "Convert to CRM Contact" button
2. On click, create or link to contact in your existing contacts table
3. Copy all relevant fields: name, email, company, role
4. Add scorecard data as custom fields or tags
5. Mark the scorecard lead as "synced_to_crm"

Ensure no duplicate contacts are created (match by email).
```

---

## Testing Checklist

After implementation, test:
- [ ] Leads display correctly in table
- [ ] Filters work (segment, date, score, status)
- [ ] KPIs calculate correctly
- [ ] Lead detail modal opens with all data
- [ ] Status updates save to database
- [ ] Notes can be added and persist
- [ ] Charts render with accurate data
- [ ] Real-time notifications work for new leads
- [ ] Bulk actions complete successfully
- [ ] CSV export downloads with correct data
- [ ] Admin-only access is enforced

---

## Styling Guidelines

Use the Teamsmiths brand:
- Primary color for CTAs and highlights
- Segment colors: Explorer (blue), Implementer (amber), Accelerator (green)
- Clean, professional layout
- Mobile responsive design
- Loading skeletons during data fetch
- Empty states with helpful messages

---

**Start with Instruction 1 and proceed sequentially. Each instruction can be given separately and tested before moving to the next.**
