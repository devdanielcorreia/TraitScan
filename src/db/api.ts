import { supabase } from './supabase';
import type {
  Profile,
  Psychologist,
  Company,
  Employee,
  Quiz,
  Question,
  Alternative,
  Assessment,
  AssessmentQuiz,
  AssessmentApplication,
  Response,
  Invitation,
  QuizWithQuestions,
  AssessmentWithQuizzes,
  UserRole,
  SubscriptionStatus,
  AssessmentStatus,
} from '@/types/database';

export const profilesApi = {
  async getCurrentProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Profile;
  },

  async updateRole(id: string, role: UserRole) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Profile;
  },
};

export const psychologistsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('psychologists')
      .select('*, profiles:profiles!psychologists_id_fkey(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('psychologists')
      .select('*, profiles:profiles!psychologists_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(psychologist: Partial<Psychologist>) {
    const { data, error } = await supabase
      .from('psychologists')
      .insert(psychologist)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Psychologist;
  },

  async update(id: string, updates: Partial<Psychologist>) {
    const { data, error } = await supabase
      .from('psychologists')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Psychologist;
  },
};

export const companiesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*, psychologists(*, profiles:profiles!psychologists_id_fkey(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*, psychologists(*, profiles:profiles!psychologists_id_fkey(*))')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByPsychologist(psychologistId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('psychologist_id', psychologistId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByProfileId(profileId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
    if (error) throw error;
    return data as Company | null;
  },

  async create(company: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Company;
  },

  async update(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Company;
  },

  async updateSubscription(id: string, status: SubscriptionStatus, stripeData?: {
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  }) {
    const { data, error } = await supabase
      .from('companies')
      .update({
        subscription_status: status,
        ...stripeData,
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Company;
  },
};

export const employeesApi = {
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Employee | null;
  },

  async create(employee: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Employee;
  },

  async update(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Employee;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const quizzesApi = {
  async getByPsychologist(psychologistId: string, includeArchived = false) {
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('psychologist_id', psychologistId);
    
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Quiz | null;
  },

  async getWithQuestions(id: string) {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (quizError) throw quizError;
    if (!quiz) return null;

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*, alternatives(*)')
      .eq('quiz_id', id)
      .order('order_number', { ascending: true });
    
    if (questionsError) throw questionsError;

    return {
      ...quiz,
      questions: Array.isArray(questions) ? questions.map(q => ({
        ...q,
        alternatives: Array.isArray(q.alternatives) 
          ? q.alternatives.sort((a: Alternative, b: Alternative) => a.order_number - b.order_number)
          : []
      })) : []
    } as QuizWithQuestions;
  },

  async create(quiz: Partial<Quiz>) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Quiz;
  },

  async update(id: string, updates: Partial<Quiz>) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Quiz;
  },

  async archive(id: string) {
    return this.update(id, { is_archived: true });
  },

  async duplicate(id: string, psychologistId: string) {
    const original = await this.getWithQuestions(id);
    if (!original) throw new Error('Quiz not found');

    const { data: newQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        psychologist_id: psychologistId,
        name: `${original.name} (Cópia)`,
        description: original.description,
      })
      .select()
      .maybeSingle();
    
    if (quizError) throw quizError;

    for (const question of original.questions) {
      const { data: newQuestion, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_id: newQuiz.id,
          question_text: question.question_text,
          order_number: question.order_number,
        })
        .select()
        .maybeSingle();
      
      if (questionError) throw questionError;

      const alternatives = question.alternatives.map(alt => ({
        question_id: newQuestion.id,
        alternative_text: alt.alternative_text,
        weight: alt.weight,
        order_number: alt.order_number,
      }));

      const { error: altError } = await supabase
        .from('alternatives')
        .insert(alternatives);
      
      if (altError) throw altError;
    }

    return newQuiz as Quiz;
  },
};

export const questionsApi = {
  async create(question: Partial<Question>) {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Question;
  },

  async update(id: string, updates: Partial<Question>) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Question;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const alternativesApi = {
  async create(alternative: Partial<Alternative>) {
    const { data, error } = await supabase
      .from('alternatives')
      .insert(alternative)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Alternative;
  },

  async update(id: string, updates: Partial<Alternative>) {
    const { data, error } = await supabase
      .from('alternatives')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Alternative;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('alternatives')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const assessmentsApi = {
  async getByPsychologist(psychologistId: string, includeArchived = false) {
    let query = supabase
      .from('assessments')
      .select('*')
      .eq('psychologist_id', psychologistId);
    
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Assessment | null;
  },

  async getWithQuizzes(id: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_quizzes (
          order_number,
          quiz_id,
          quizzes (
            *,
            questions (
              *,
              alternatives (*)
            )
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const assessmentQuizzes = Array.isArray(data.assessment_quizzes)
      ? data.assessment_quizzes.map((aq: any) => ({
          ...aq,
          quiz: {
            ...aq.quizzes,
            questions: Array.isArray(aq.quizzes?.questions)
              ? aq.quizzes.questions.map((q: any) => ({
                  ...q,
                  alternatives: Array.isArray(q.alternatives)
                    ? q.alternatives.sort(
                        (a: Alternative, b: Alternative) => a.order_number - b.order_number,
                      )
                    : [],
                }))
              : [],
          },
        }))
      : [];

    return {
      ...data,
      assessment_quizzes: assessmentQuizzes,
    } as AssessmentWithQuizzes;
  },

  async create(assessment: Partial<Assessment>) {
    const { data, error } = await supabase
      .from('assessments')
      .insert(assessment)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Assessment;
  },

  async update(id: string, updates: Partial<Assessment>) {
    const { data, error } = await supabase
      .from('assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Assessment;
  },

  async archive(id: string) {
    return this.update(id, { is_archived: true });
  },

  async addQuiz(assessmentId: string, quizId: string, orderNumber: number) {
    const { data, error } = await supabase
      .from('assessment_quizzes')
      .insert({
        assessment_id: assessmentId,
        quiz_id: quizId,
        order_number: orderNumber,
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as AssessmentQuiz;
  },

  async removeQuiz(assessmentId: string, quizId: string) {
    const { error } = await supabase
      .from('assessment_quizzes')
      .delete()
      .eq('assessment_id', assessmentId)
      .eq('quiz_id', quizId);
    if (error) throw error;
  },
};

export const applicationsApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('assessment_applications')
      .select('*, assessments(*), employees(*), companies(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByPsychologist(psychologistId: string) {
    const { data, error } = await supabase
      .from('assessment_applications')
      .select('*, assessments(*), employees(*), companies(*)')
      .eq('psychologist_id', psychologistId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('assessment_applications')
      .select('*, assessments(*), employees(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByToken(token: string) {
    const { data, error } = await supabase
      .from('assessment_applications')
      .select('*, assessments(*), employees(*)')
      .eq('unique_token', token)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(application: Partial<AssessmentApplication>) {
    const { data, error } = await supabase
      .from('assessment_applications')
      .insert(application)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as AssessmentApplication;
  },

  async updateStatus(id: string, status: AssessmentStatus, timestamps?: {
    started_at?: string;
    completed_at?: string;
  }) {
    const { data, error } = await supabase
      .from('assessment_applications')
      .update({
        status,
        ...timestamps,
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as AssessmentApplication;
  },
};

export const responsesApi = {
  async getByApplication(applicationId: string) {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        questions(*, quizzes(*)),
        alternatives(*)
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(response: Partial<Response>) {
    const { data, error } = await supabase
      .from('responses')
      .insert(response)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Response;
  },

  async upsert(response: Partial<Response>) {
    const { data, error } = await supabase
      .from('responses')
      .upsert(response, {
        onConflict: 'application_id,question_id',
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Response;
  },
};

export const invitationsApi = {
  async getByInviter(inviterId: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invited_by', inviterId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByToken(token: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    if (error) throw error;
    return data as Invitation | null;
  },

  async create(invitation: Partial<Invitation>) {
    const { data, error } = await supabase
      .from('invitations')
      .insert(invitation)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Invitation;
  },

  async accept(token: string) {
    const { data, error } = await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('token', token)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Invitation;
  },
};

export const adminInvitationsApi = {
  async listInvitations() {
    const { data, error } = await supabase
      .from('invitations')
      .select('id, token, invitee_name, email, role, status, expires_at, invited_by, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async createInvitation(payload: {
    name: string;
    email?: string | null;
    role: UserRole;
    invitedBy: string;
    company_id?: string | null;
    psychologist_id?: string | null;
  }) {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        invitee_name: payload.name,
        email: payload.email || null,
        role: payload.role,
        company_id: payload.company_id,
        psychologist_id: payload.psychologist_id,
        invited_by: payload.invitedBy,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const adminApi = {
  async getOverview() {
    const requests = await Promise.all([
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'company'),
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'psychologist'),
      supabase
        .from('psychologists')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase.from('employees').select('id', { count: 'exact', head: true }),
      supabase
        .from('invitations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    const extractCount = (result: { count: number | null; error: any }) => {
      if (result.error) throw result.error;
      return result.count ?? 0;
    };

    return {
      companies: extractCount(requests[0]),
      activeCompanies: extractCount(requests[1]),
      psychologists: extractCount(requests[2]),
      activePsychologists: extractCount(requests[3]),
      employees: extractCount(requests[4]),
      pendingInvitations: extractCount(requests[5]),
    };
  },

  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select(
        `
        id,
        name,
        email,
        subscription_status,
        trial_ends_at,
        is_active,
        created_at,
        psychologist:psychologists(
          id,
          profiles:profiles!psychologists_id_fkey(
            id,
            full_name,
            email
          )
        )
      `,
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async setCompanyActive(companyId: string, active: boolean) {
    const { error } = await supabase
      .from('companies')
      .update({ is_active: active })
      .eq('id', companyId);
    if (error) throw error;
  },

  async getPsychologists() {
    const { data, error } = await supabase
      .from('psychologists')
      .select(
        `
        id,
        license_number,
        specialization,
        is_active,
          profiles:profiles!psychologists_id_fkey(
            id,
            full_name,
            email,
            role
          )
      `,
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async setPsychologistActive(psychologistId: string, active: boolean) {
    const { error } = await supabase
      .from('psychologists')
      .update({ is_active: active })
      .eq('id', psychologistId);
    if (error) throw error;
  },

  async updatePsychologistRole(profileId: string, role: UserRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', profileId);
    if (error) throw error;
  },

  async getBillingSummary() {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, subscription_status, trial_ends_at');
    if (error) throw error;

    const entries = Array.isArray(data) ? data : [];
    const baseStatuses = ['trial', 'active', 'past_due', 'cancelled', 'inactive'];
    const counts: Record<string, number> = {};
    baseStatuses.forEach((status) => {
      counts[status] = 0;
    });

    for (const company of entries) {
      const status = company.subscription_status ?? 'inactive';
      counts[status] = (counts[status] ?? 0) + 1;
    }

    const expiringTrials = entries
      .filter(
        (company) =>
          company.subscription_status === 'trial' && company.trial_ends_at,
      )
      .sort(
        (a, b) =>
          new Date(a.trial_ends_at!).getTime() -
          new Date(b.trial_ends_at!).getTime(),
      )
      .slice(0, 5);

    return {
      counts,
      expiringTrials,
    };
  },
};
