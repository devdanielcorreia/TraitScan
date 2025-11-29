export type UserRole = 'superadmin' | 'psychologist' | 'company';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'inactive';
export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'expired';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Psychologist {
  id: string;
  license_number: string | null;
  specialization: string | null;
  bio: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  psychologist_id: string | null;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  position: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  psychologist_id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  order_number: number;
  created_at: string;
}

export interface Alternative {
  id: string;
  question_id: string;
  alternative_text: string;
  weight: number;
  order_number: number;
  created_at: string;
}

export interface Assessment {
  id: string;
  psychologist_id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuiz {
  id: string;
  assessment_id: string;
  quiz_id: string;
  order_number: number | null;
  created_at: string;
}

export interface AssessmentApplication {
  id: string;
  assessment_id: string;
  employee_id: string;
  company_id: string;
  psychologist_id: string;
  unique_token: string;
  status: AssessmentStatus;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Response {
  id: string;
  application_id: string;
  question_id: string;
  alternative_id: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string;
  company_id: string | null;
  psychologist_id: string | null;
  status: InvitationStatus;
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: (Question & { alternatives: Alternative[] })[];
}

export interface AssessmentWithQuizzes extends Assessment {
  assessment_quizzes: (AssessmentQuiz & { quiz: Quiz })[];
}

export interface ApplicationWithDetails extends AssessmentApplication {
  assessment: Assessment;
  employee: Employee;
  company: Company;
  responses: Response[];
}

export interface QuizScore {
  quiz_id: string;
  quiz_name: string;
  total_score: number;
  max_score: number;
  percentage: number;
}

export interface AssessmentReport {
  application_id: string;
  employee_name: string;
  assessment_name: string;
  completed_at: string | null;
  quiz_scores: QuizScore[];
  overall_percentage: number;
}
