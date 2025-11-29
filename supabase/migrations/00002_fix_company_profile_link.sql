/*
# Atualiza vínculo entre perfis e empresas

- Adiciona `profile_id` em `companies` referenciando `profiles`.
- Migra relacionamentos existentes e remove `profiles.company_id`.
- Recria políticas RLS para usar `companies.profile_id`.
*/

-- Adiciona coluna e vínculo com profiles
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS profile_id uuid;

ALTER TABLE companies
  ADD CONSTRAINT companies_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE companies
  ADD CONSTRAINT companies_profile_id_key UNIQUE (profile_id);

CREATE INDEX IF NOT EXISTS idx_companies_profile ON companies(profile_id);

-- Migra possíveis vínculos existentes baseados em profiles.company_id
UPDATE companies c
SET profile_id = p.id
FROM profiles p
WHERE p.company_id = c.id
  AND c.profile_id IS NULL;

-- Remove políticas antigas que usavam profiles.company_id
DROP POLICY IF EXISTS "Companies can view own record" ON companies;
DROP POLICY IF EXISTS "Companies can view own employees" ON employees;
DROP POLICY IF EXISTS "Companies can manage own employees" ON employees;
DROP POLICY IF EXISTS "Companies can view applications for their employees" ON assessment_applications;
DROP POLICY IF EXISTS "Companies can view responses for their employees" ON responses;

-- Remove coluna obsoleta em profiles
ALTER TABLE profiles
  DROP COLUMN IF EXISTS company_id;

-- Cria políticas alinhadas ao novo relacionamento
CREATE POLICY "Companies view own" ON companies
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Companies update own" ON companies
  FOR UPDATE TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Companies manage own employees" ON employees
  FOR ALL TO authenticated USING (
    company_id IN (SELECT id FROM companies WHERE profile_id = auth.uid())
  );

CREATE POLICY "Companies view own applications" ON assessment_applications
  FOR SELECT TO authenticated USING (
    company_id IN (SELECT id FROM companies WHERE profile_id = auth.uid())
  );

CREATE POLICY "Companies view own responses" ON responses
  FOR SELECT TO authenticated USING (
    application_id IN (
      SELECT id FROM assessment_applications
      WHERE company_id IN (SELECT id FROM companies WHERE profile_id = auth.uid())
    )
  );
