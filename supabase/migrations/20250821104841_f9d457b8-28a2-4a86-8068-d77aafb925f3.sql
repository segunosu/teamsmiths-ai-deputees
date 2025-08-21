-- Fix the missing participant for the Lead Gen project
INSERT INTO project_participants (project_id, user_id, role)
VALUES ('51e1d58d-8c83-4e7f-8eba-a7e0a7e881c3', 'af0f6416-bc3f-4c22-b543-57aa10c83a7c', 'owner')
ON CONFLICT DO NOTHING;