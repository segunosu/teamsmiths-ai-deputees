# EXACT INSTRUCTIONS FOR LOVABLE CRM PROJECT

Copy and paste these instructions **one at a time** into the Lovable CRM AI project.
Project URL: https://lovable.dev/projects/60b7bde4-08fc-4a6a-a5c4-a9e917ed8fb9

---

## INSTRUCTION 1: Connect to Scorecard Database

```
Connect to the existing Supabase database that contains AI Impact Scorecard leads.

Database connection details:
- Supabase URL: https://iyqsbjawaampgcavsgcz.supabase.co
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTI2MTgsImV4cCI6MjA2NjE2ODYxOH0.yOhYxzUyFYbxdu1neuagXqa2xXuhIAoWBYr3w0acNb0

Create a new Supabase client instance using these credentials that can be used throughout the app to query scorecard data.

This is a separate database from the main CRM database - it's specifically for scorecard leads.
```

**Wait for confirmation before proceeding to Instruction 2.**

---

## INSTRUCTION 2: Create Scorecard Leads Page

```
Create a new page at the route /scorecard-leads that displays leads from the AI Impact Scorecard.

Requirements:

1. Fetch data from the view: scorecard_leads_view
   Query all columns, order by created_at DESC

2. Display a header section with 4 KPI cards showing:
   - Total Leads: COUNT(*)
   - New Leads: COUNT where crm_lead_status = 'new'
   - Booked Sessions: COUNT where booked_session = true
   - Converted: COUNT where converted_to_project = true

3. Create 4 tabs for filtering:
   - "All Leads" (no filter)
   - "Explorers" (filter: segment = 'Explorer')
   - "Implementers" (filter: segment = 'Implementer')
   - "Accelerators" (filter: segment = 'Accelerator')

4. Display leads in a table with these columns:
   - Name
   - Email
   - Company
   - Total Score (with color: red if <40, yellow if 40-70, green if >70)
   - Segment (with badge: blue for Explorer, amber for Implementer, green for Accelerator)
   - Status (crm_lead_status)
   - Created Date (formatted)
   - Actions (View button)

5. Make the page accessible only to admin users

Use Tanstack Query for data fetching, Shadcn Table component for the table, and Shadcn Badge for segment display.
```

**Wait for confirmation before proceeding to Instruction 3.**

---

## INSTRUCTION 3: Add Real-Time Notifications

```
Add real-time notifications for new high-value leads on the /scorecard-leads page.

Requirements:

1. Use Supabase real-time subscriptions to listen for INSERT events on the scorecard_responses table

2. Filter for high-value leads:
   - segment = 'Accelerator' OR
   - total_score >= 70

3. When a new high-value lead arrives:
   - Show a toast notification with:
     * Title: "🔥 New Hot Lead!"
     * Message: "[Name] from [Company] scored [Score]/100"
     * Action button: "View Lead"
   - Play notification sound (optional)
   - Automatically refresh the leads list

4. Subscribe on component mount, unsubscribe on unmount

Use Supabase realtime channels for the subscription and Shadcn toast for notifications.
```

**Wait for confirmation before proceeding to Instruction 4.**

---

## INSTRUCTION 4: Create Lead Detail Modal

```
Create a modal component that opens when clicking "View" on a lead in the table.

The modal should display:

1. Header with lead name and segment badge

2. Contact Information section:
   - Name
   - Email (with mailto link)
   - Company
   - Role

3. Score Breakdown section:
   - Large display of total_score with /100
   - Progress bars for each dimension:
     * Readiness: readiness_score
     * Reach: reach_score
     * Prowess: prowess_score
     * Protection: protection_score

4. Status & Tracking section:
   - Current Status dropdown (crm_lead_status) with options: new, contacted, qualified, converted
   - Booked Session checkbox (booked_session)
   - Converted to Project checkbox (converted_to_project)
   - Last Contacted date (last_contacted_at)

5. Notes section:
   - Textarea for notes field
   - Save button

6. UTM Data section (if available):
   - Source: source
   - UTM Source: utm_source
   - UTM Medium: utm_medium
   - UTM Campaign: utm_campaign

7. Action buttons:
   - "Mark as Contacted" - updates crm_lead_status to 'contacted' and sets last_contacted_at
   - "Mark Session Booked" - sets booked_session = true and crm_lead_status = 'engaged'
   - "Mark Converted" - sets converted_to_project = true and crm_lead_status = 'customer'
   - "Save Notes" - updates notes field

All updates should write to the scorecard_responses table using Supabase update queries. Show success toasts after updates.

Use Shadcn Dialog for the modal, Progress for score bars, Select for status dropdown, and Button components.
```

**Wait for confirmation before proceeding to Instruction 5.**

---

## INSTRUCTION 5: Add Filter Controls

```
Add filter controls above the leads table on /scorecard-leads page.

Add these filters:

1. Date Range Filter:
   - Date picker with "From" and "To" dates
   - Filter where created_at is between selected dates
   - Default: Last 30 days

2. Score Range Filter:
   - Dual slider from 0 to 100
   - Filter where total_score is between selected min and max
   - Default: 0 to 100 (show all)

3. Status Filter:
   - Multi-select dropdown with options:
     * new
     * contacted
     * qualified
     * converted
   - Filter where crm_lead_status is in selected values
   - Default: All selected

4. Search Box:
   - Text input
   - Search across: name, email, company
   - Case-insensitive

5. Clear Filters button to reset all filters

All filters should work together (AND logic). Update the Tanstack Query to include filter parameters.

Use Shadcn Calendar/DatePicker for dates, Slider for score range, Multi-Select for status, and Input for search.
```

**Wait for confirmation before proceeding to Instruction 6.**

---

## INSTRUCTION 6: Add Charts Dashboard

```
Create a dashboard section above the leads table on /scorecard-leads page.

Add these charts using Recharts:

1. Lead Volume Over Time (Line Chart):
   - X-axis: Date (last 30 days)
   - Y-axis: Number of leads
   - Group by day
   - Color by segment (3 lines: Explorer, Implementer, Accelerator)

2. Segment Distribution (Pie Chart):
   - Show percentage split of Explorer / Implementer / Accelerator
   - Use segment colors: blue, amber, green

3. Conversion Funnel (Bar Chart):
   - Bars for:
     * Total Leads
     * Contacted (crm_lead_status = 'contacted')
     * Booked Session (booked_session = true)
     * Converted (converted_to_project = true)
   - Show numbers and percentages

4. Average Scores by Segment (Horizontal Bar Chart):
   - One bar per segment
   - Show average total_score for each segment
   - Color bars by segment

All charts should:
- Update based on current filters
- Have responsive design
- Show tooltips on hover
- Use consistent color scheme

Query the data using Supabase aggregation queries and group by functions.

Use Recharts components: LineChart, PieChart, BarChart. Wrap charts in Shadcn Card components.
```

**Wait for confirmation before proceeding to Instruction 7.**

---

## INSTRUCTION 7: Add Bulk Actions

```
Add bulk action functionality to the /scorecard-leads page.

Requirements:

1. Add checkbox column to the table:
   - Header checkbox to select/deselect all
   - Row checkboxes to select individual leads

2. Show bulk actions toolbar when leads are selected:
   - Display: "[X] leads selected"
   - Actions available:
     * "Mark as Contacted"
     * "Mark as Qualified"
     * "Export to CSV"
     * "Clear Selection"

3. Implement each action:

   Mark as Contacted:
   - Update all selected leads
   - Set crm_lead_status = 'contacted'
   - Set last_contacted_at = now()
   - Show confirmation dialog before executing
   - Show progress indicator during update
   - Show success toast with count

   Mark as Qualified:
   - Update all selected leads
   - Set crm_lead_status = 'qualified'
   - Show confirmation dialog
   - Show progress and success toast

   Export to CSV:
   - Generate CSV file with all columns
   - Include: name, email, company, role, total_score, segment, status, created_at
   - Format dates as readable strings
   - Trigger download
   - Show success toast

4. Use Promise.all for parallel updates to multiple leads
5. Handle errors gracefully - if some updates fail, show which ones succeeded
6. Clear selection after successful bulk action

Use Shadcn Checkbox, AlertDialog for confirmations, and implement CSV export using a library or native browser download.
```

**Wait for confirmation before proceeding to Instruction 8.**

---

## INSTRUCTION 8: Add Navigation & Access Control

```
Add the Scorecard Leads page to the CRM navigation and implement access control.

Requirements:

1. Add navigation link:
   - Add "Scorecard Leads" to the main navigation menu
   - Icon: Target or Zap icon from lucide-react
   - Route: /scorecard-leads
   - Place it after "Dashboard" or in appropriate location

2. Implement admin-only access:
   - Check if current user has is_admin = true
   - If not admin, redirect to home page or show "Access Denied" message
   - Use a route guard or check in the component

3. Add badge showing count of new leads:
   - Query COUNT where crm_lead_status = 'new'
   - Display badge next to "Scorecard Leads" in nav
   - Update in real-time using Supabase subscription

4. Add page title and breadcrumbs:
   - Page title: "Scorecard Leads"
   - Breadcrumb: Home > Scorecard Leads

Use your existing navigation pattern, auth context for user checking, and Shadcn Badge for the count indicator.
```

**Wait for confirmation before proceeding to Instruction 9.**

---

## INSTRUCTION 9: Add Activity Timeline

```
Add an activity timeline to the lead detail modal showing the history of interactions.

Requirements:

1. Query the scorecard_automation_log table:
   - Filter: scorecard_id = current lead id
   - Order by: created_at DESC
   - Include: action_type, action_data, status, created_at

2. Display timeline showing:
   - Scorecard completed (created_at from scorecard_responses)
   - Emails sent (action_type = 'email_sent')
   - Alerts triggered (action_type = 'alert_sent')
   - Status changes (track when crm_lead_status changed)
   - Notes added (track when notes field updated)

3. Format each timeline item:
   - Icon based on action type
   - Timestamp (relative: "2 hours ago" or absolute)
   - Description of action
   - Expandable details if action_data has more info

4. Add a "Add Note" quick action:
   - Text input
   - Add button
   - Saves to notes field with timestamp prefix
   - Shows in timeline immediately

Use a vertical timeline component with connecting lines, Shadcn icons, and format timestamps with date-fns library.
```

**Wait for confirmation before proceeding to Instruction 10.**

---

## INSTRUCTION 10: Add Email Queue Monitor (Admin View)

```
Create an admin-only page at /scorecard-leads/email-queue to monitor the automated email system.

Requirements:

1. Display data from scorecard_email_queue table:
   - Show columns: to_email, scheduled_for, sent_at, status, template info
   - Join with scorecard_email_templates to show: segment, day_number, subject
   - Order by: scheduled_for DESC

2. Filter tabs:
   - Pending (status = 'pending')
   - Sent (status = 'sent')
   - Failed (status = 'failed')

3. Show statistics:
   - Total queued
   - Sent today
   - Failed count
   - Next scheduled (earliest pending)

4. Actions:
   - "Retry Failed" button - changes status back to 'pending'
   - "Cancel" button for pending emails - sets status to 'cancelled'
   - "View Template" - shows the template details

5. Add a "Manual Trigger" button:
   - Calls the process-scorecard-emails edge function manually
   - Shows loading state
   - Displays results (how many sent/failed)

6. Auto-refresh every 60 seconds

Query using Supabase joins and filters. Use Shadcn Table, Tabs, and Button components.
```

**This is the final instruction. After completing all 10 instructions, the CRM integration will be fully functional.**

---

## TESTING CHECKLIST

After completing all instructions, test these scenarios:

- [ ] Submit a test scorecard from the main app
- [ ] Verify lead appears in CRM /scorecard-leads page
- [ ] Check that real-time notification appears for Accelerator leads
- [ ] Open lead detail modal and verify all data displays
- [ ] Update lead status and verify it saves
- [ ] Add notes and verify they save
- [ ] Check booked_session and converted checkboxes work
- [ ] Test filters (date, score, status, search)
- [ ] Verify charts display correct data
- [ ] Test bulk actions (select multiple, mark as contacted)
- [ ] Export CSV and verify data
- [ ] Check navigation badge shows new lead count
- [ ] View activity timeline in lead detail
- [ ] Check email queue monitor page shows queued emails
- [ ] Verify access control (non-admins can't access)

---

## TROUBLESHOOTING

**If leads don't appear:**
- Check Supabase connection credentials
- Verify RLS policies allow SELECT on scorecard_leads_view
- Check browser console for errors

**If real-time notifications don't work:**
- Verify Supabase realtime is enabled in project settings
- Check channel subscription is active
- Look for WebSocket connection in Network tab

**If updates fail:**
- Check RLS policies allow UPDATE on scorecard_responses
- Verify user has proper authentication
- Check browser console for specific error messages

---

## SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify all environment variables are set
4. Ensure Supabase RLS policies are correct

**Database Information:**
- Project: https://iyqsbjawaampgcavsgcz.supabase.co
- Main table: scorecard_responses
- View: scorecard_leads_view
- Email queue: scorecard_email_queue
- Automation log: scorecard_automation_log

---

**END OF INSTRUCTIONS**
