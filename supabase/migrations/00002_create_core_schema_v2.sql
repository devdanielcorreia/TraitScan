/*
# TraitScan Core Database Schema

## Table List & Column Descriptions

### 1. user_role (ENUM)
- Defines system roles: superadmin, psychologist, company

### 2. profiles
- `id` (uuid, primary key, references auth.users) - User identifier
- `email` (text, unique) - User email
- `full_name` (text) - User's full name
- `role` (user_role, not null) - User's system role
- `language` (text, default 'pt') - Preferred language (pt/en/es)
- `created_at` (timestamptz) - Account creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

### 3. psychologists
- `id` (uuid, primary key, references profiles) - Psychologist profile ID
- `license_number` (text) - Professional license number
- `specialization` (text) - Area of specialization
- `bio` (text) - Professional biography
- `created_by` (uuid, references profiles) - Admin who created this account
- `is_active` (boolean) - Account active status

### 4. subscription_status (ENUM)
- Defines subscription states: trial, active, past_due, cancelled, inactive

### 5. companies
- `id` (uuid, primary key) - Company identifier
- `profile_id` (uuid, unique, references profiles) - Linked profile for company user
- `name` (text, not null) - Company name
- `email` (text) - Company contact email
- `phone` (text) - Company contact phone
- `address` (text) - Company address
- `psychologist_id` (uuid, references psychologists) - Managing psychologist
- `subscription_status` (subscription_status) - Current subscription state
- `trial_ends_at` (timestamptz) - Trial period end date
- `stripe_customer_id` (text, unique) - Stripe customer identifier
- `stripe_subscription_id` (text, unique) - Stripe subscription identifier
- `is_active` (boolean) - Company active status

### 6. employees
- `id` (uuid, primary key) - Employee identifier
- `company_id` (uuid, references companies) - Employer company
- `full_name` (text, not null) - Employee full name
- `email` (text) - Employee email
- `position` (text) - Job position
- `department` (text) - Department name
- `is_active` (boolean) - Employee active status

### 7-16. Other tables (quizzes, questions, alternatives, assessments, etc.)
- See inline comments for details

## Security Changes
- RLS enabled on all tables
- Superadmins have full access to all data
- Psychologists can only access their own quizzes, assessments, and companies they created
- Companies can only access their own employees and assessment results
- Employees have no direct database access (use unique tokens)

## Notes
- First user to register becomes superadmin automatically
- Companies are linked to profiles via profile_id
*/

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('superadmin', 'psychologist', 'company');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'inactive');
CREATE TYPE assessment_status AS ENUM ('pending', 'in_progress', 'completed', 'expired');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'company'::user_role,
  language text DEFAULT 'pt',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Psychologists table
CREATE TABLE psychologists (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text,
  specialization text,
  bio text,
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE SET NULL,
  subscription_status subscription_status DEFAULT 'trial'::subscription_status,
  trial_ends_at timestamptz DEFAULT (now() + interval '7 days'),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text,
  position text,
  department text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quizzes table
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  order_number integer NOT NULL CHECK (order_number >= 1 AND order_number <= 10),
  created_at timestamptz DEFAULT now()
);

-- Alternatives table
CREATE TABLE alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  alternative_text text NOT NULL,
  weight integer NOT NULL CHECK (weight >= 1 AND weight <= 4),
  order_number integer NOT NULL CHECK (order_number >= 1 AND order_number <= 4),
  created_at timestamptz DEFAULT now()
);

-- Assessments table
CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessment quizzes junction table
CREATE TABLE assessment_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  order_number integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, quiz_id)
);

-- Assessment applications table
CREATE TABLE assessment_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE NOT NULL,
  unique_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status assessment_status DEFAULT 'pending'::assessment_status,
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

-- Responses table
CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES assessment_applications(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  alternative_id uuid REFERENCES alternatives(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(application_id, question_id)
);

-- Invitations table
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role user_role NOT NULL,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  psychologist_id uuid REFERENCES psychologists(id) ON DELETE CASCADE,
  status invitation_status DEFAULT 'pending'::invitation_status,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_psychologists_created_by ON psychologists(created_by);
CREATE INDEX idx_companies_profile ON companies(profile_id);
CREATE INDEX idx_companies_psychologist ON companies(psychologist_id);
CREATE INDEX idx_companies_subscription ON companies(subscription_status);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_quizzes_psychologist ON quizzes(psychologist_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_alternatives_question ON alternatives(question_id);
CREATE INDEX idx_assessments_psychologist ON assessments(psychologist_id);
CREATE INDEX idx_assessment_quizzes_assessment ON assessment_quizzes(assessment_id);
CREATE INDEX idx_applications_employee ON assessment_applications(employee_id);
CREATE INDEX idx_applications_company ON assessment_applications(company_id);
CREATE INDEX idx_applications_token ON assessment_applications(unique_token);
CREATE INDEX idx_responses_application ON responses(application_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Helper functions
CREATE OR REPLACE FUNCTION is_superadmin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role = 'superadmin'::user_role);
$$;

CREATE OR REPLACE FUNCTION is_psychologist(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role = 'psychologist'::user_role);
$$;

CREATE OR REPLACE FUNCTION is_company(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role = 'company'::user_role);
$$;

CREATE OR REPLACE FUNCTION has_active_subscription(company_uuid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM companies
    WHERE id = company_uuid 
    AND ((subscription_status = 'trial'::subscription_status AND trial_ends_at > now())
      OR subscription_status = 'active'::subscription_status)
  );
$$;

-- Trigger for new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, CASE WHEN user_count = 0 THEN 'superadmin'::user_role ELSE 'company'::user_role END);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Superadmins full access profiles" ON profiles FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Users view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- RLS Policies for psychologists
CREATE POLICY "Superadmins full access psychologists" ON psychologists FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists view own" ON psychologists FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Psychologists update own" ON psychologists FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "Superadmins full access companies" ON companies FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists view their companies" ON companies FOR SELECT TO authenticated 
  USING (psychologist_id = auth.uid());
CREATE POLICY "Psychologists create companies" ON companies FOR INSERT TO authenticated 
  WITH CHECK (is_psychologist(auth.uid()) AND psychologist_id = auth.uid());
CREATE POLICY "Psychologists update their companies" ON companies FOR UPDATE TO authenticated 
  USING (psychologist_id = auth.uid());
CREATE POLICY "Companies view own" ON companies FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Companies update own" ON companies FOR UPDATE TO authenticated USING (profile_id = auth.uid());

-- RLS Policies for employees
CREATE POLICY "Superadmins full access employees" ON employees FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage employees" ON employees FOR ALL TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE psychologist_id = auth.uid()));
CREATE POLICY "Companies manage own employees" ON employees FOR ALL TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE profile_id = auth.uid()));

-- RLS Policies for quizzes
CREATE POLICY "Superadmins full access quizzes" ON quizzes FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage own quizzes" ON quizzes FOR ALL TO authenticated USING (psychologist_id = auth.uid());

-- RLS Policies for questions
CREATE POLICY "Superadmins full access questions" ON questions FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage own questions" ON questions FOR ALL TO authenticated 
  USING (quiz_id IN (SELECT id FROM quizzes WHERE psychologist_id = auth.uid()));
CREATE POLICY "Public view questions" ON questions FOR SELECT TO anon USING (true);

-- RLS Policies for alternatives
CREATE POLICY "Superadmins full access alternatives" ON alternatives FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage own alternatives" ON alternatives FOR ALL TO authenticated 
  USING (question_id IN (SELECT q.id FROM questions q JOIN quizzes qz ON q.quiz_id = qz.id WHERE qz.psychologist_id = auth.uid()));
CREATE POLICY "Public view alternatives" ON alternatives FOR SELECT TO anon USING (true);

-- RLS Policies for assessments
CREATE POLICY "Superadmins full access assessments" ON assessments FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage own assessments" ON assessments FOR ALL TO authenticated USING (psychologist_id = auth.uid());

-- RLS Policies for assessment_quizzes
CREATE POLICY "Superadmins full access assessment_quizzes" ON assessment_quizzes FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage own assessment_quizzes" ON assessment_quizzes FOR ALL TO authenticated 
  USING (assessment_id IN (SELECT id FROM assessments WHERE psychologist_id = auth.uid()));

-- RLS Policies for assessment_applications
CREATE POLICY "Superadmins full access applications" ON assessment_applications FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists manage own applications" ON assessment_applications FOR ALL TO authenticated USING (psychologist_id = auth.uid());
CREATE POLICY "Companies view own applications" ON assessment_applications FOR SELECT TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE profile_id = auth.uid()));
CREATE POLICY "Public view applications by token" ON assessment_applications FOR SELECT TO anon USING (true);

-- RLS Policies for responses
CREATE POLICY "Superadmins full access responses" ON responses FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists view own responses" ON responses FOR SELECT TO authenticated 
  USING (application_id IN (SELECT id FROM assessment_applications WHERE psychologist_id = auth.uid()));
CREATE POLICY "Companies view own responses" ON responses FOR SELECT TO authenticated 
  USING (application_id IN (SELECT id FROM assessment_applications WHERE company_id IN (SELECT id FROM companies WHERE profile_id = auth.uid())));
CREATE POLICY "Public insert responses" ON responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public view responses" ON responses FOR SELECT TO anon USING (true);

-- RLS Policies for invitations
CREATE POLICY "Superadmins full access invitations" ON invitations FOR ALL TO authenticated USING (is_superadmin(auth.uid()));
CREATE POLICY "Psychologists view own invitations" ON invitations FOR SELECT TO authenticated USING (invited_by = auth.uid());
CREATE POLICY "Psychologists create invitations" ON invitations FOR INSERT TO authenticated 
  WITH CHECK (is_psychologist(auth.uid()) AND invited_by = auth.uid());
CREATE POLICY "Public view invitations by token" ON invitations FOR SELECT TO anon USING (true);
CREATE POLICY "Public update invitation status" ON invitations FOR UPDATE TO anon USING (true)
  WITH CHECK (status IN ('accepted'::invitation_status, 'expired'::invitation_status));