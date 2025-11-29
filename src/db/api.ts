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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('psychologists')
      .select('*, profiles(*)')
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
      .select('*, psychologists(*, profiles(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*, psychologists(*, profiles(*))')
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
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (assessmentError) throw assessmentError;
    if (!assessment) return null;

    const { data: assessmentQuizzes, error: quizzesError } = await supabase
      .from('assessment_quizzes')
      .select('*, quizzes(*)')
      .eq('assessment_id', id)
      .order('order_number', { ascending: true });
    
    if (quizzesError) throw quizzesError;

    return {
      ...assessment,
      assessment_quizzes: Array.isArray(assessmentQuizzes) ? assessmentQuizzes.map(aq => ({
        ...aq,
        quiz: aq.quizzes
      })) : []
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
