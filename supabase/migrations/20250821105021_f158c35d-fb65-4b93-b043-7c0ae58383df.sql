-- Backfill missing client participant for projects where the creator isn't added yet
INSERT INTO project_participants (project_id, user_id, role)
SELECT p.id, p.teamsmith_user_id, 'client'
FROM projects p
WHERE p.teamsmith_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM project_participants pp
    WHERE pp.project_id = p.id AND pp.user_id = p.teamsmith_user_id
  );