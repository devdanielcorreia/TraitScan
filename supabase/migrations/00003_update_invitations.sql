-- Add invitee_name column and make email optional
ALTER TABLE invitations ADD COLUMN invitee_name text;
UPDATE invitations SET invitee_name = email;
ALTER TABLE invitations ALTER COLUMN invitee_name SET NOT NULL;
ALTER TABLE invitations ALTER COLUMN email DROP NOT NULL;
