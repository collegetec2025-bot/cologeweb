import { supabase } from '@/lib/supabase';
import type {
  Profile, Grade, Transcript, Invoice, Payment, Scholarship,
  SupportTicket, AuditLog, CalendarEvent, Department, Syllabus,
} from '@/lib/supabase';
import type { Lang } from '@/lib/i18n';

// ============================================================
// GRADEBOOK SERVICE — CGPA calculation, letter grades
// ============================================================

export function calculateLetterGrade(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

export function gradePoints(letter: string): number {
  const map: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
  return map[letter] ?? 0;
}

export function calculateCGPA(grades: Grade[], courseCredits: Record<string, number> = {}): number {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const g of grades) {
    const credits = courseCredits[g.course_id] ?? 3;
    const points = gradePoints(g.letter_grade || calculateLetterGrade(g.score, g.max_score));
    totalPoints += points * credits;
    totalCredits += credits;
  }
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}

export const gradebookService = {
  async getStudentGrades(studentId: string): Promise<Grade[]> {
    const { data, error } = await supabase
      .from('grades')
      .select('*, course:courses(*), assignment:assignments(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Grade[]) ?? [];
  },

  async getCourseGrades(courseId: string): Promise<Grade[]> {
    const { data, error } = await supabase
      .from('grades')
      .select('*, course:courses(*), assignment:assignments(*)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Grade[]) ?? [];
  },

  async createGrade(input: {
    student_id: string;
    course_id: string;
    assignment_id?: string | null;
    score: number;
    max_score: number;
    feedback_en?: string;
    graded_by: string;
  }): Promise<Grade> {
    const letter = calculateLetterGrade(input.score, input.max_score);
    const { data, error } = await supabase
      .from('grades')
      .insert({ ...input, letter_grade: letter })
      .select('*')
      .single();
    if (error) throw error;
    return data as Grade;
  },

  async updateGrade(id: string, score: number, maxScore: number, feedback?: string): Promise<Grade> {
    const letter = calculateLetterGrade(score, maxScore);
    const { data, error } = await supabase
      .from('grades')
      .update({ score, max_score: maxScore, letter_grade: letter, feedback_en: feedback ?? '' })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Grade;
  },
};

// ============================================================
// TRANSCRIPT SERVICE — soft delete, CGPA recording
// ============================================================

export const transcriptService = {
  async getStudentTranscripts(studentId: string): Promise<Transcript[]> {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('student_id', studentId)
      .neq('status', 'deleted')
      .order('issued_at', { ascending: false });
    if (error) throw error;
    return (data as Transcript[]) ?? [];
  },

  async createTranscript(input: {
    student_id: string;
    semester: string;
    cgpa: number;
    total_credits: number;
  }): Promise<Transcript> {
    const { data, error } = await supabase
      .from('transcripts')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Transcript;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transcripts')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// FINANCE SERVICE — invoices, payments, scholarships
// ============================================================

export const financeService = {
  async getStudentInvoices(studentId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Invoice[]) ?? [];
  },

  async getAllInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Invoice[]) ?? [];
  },

  async createInvoice(input: {
    invoice_number: string;
    student_id: string;
    amount: number;
    description_en?: string;
    due_date?: string;
  }): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Invoice;
  },

  async markInvoicePaid(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async getPayments(invoiceId?: string): Promise<Payment[]> {
    let q = supabase.from('payments').select('*, invoice:invoices(*)');
    if (invoiceId) q = q.eq('invoice_id', invoiceId);
    q = q.order('created_at', { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as Payment[]) ?? [];
  },

  async recordPayment(input: {
    invoice_id: string;
    student_id: string;
    amount: number;
    payment_method: 'card' | 'bank_transfer' | 'cash' | 'scholarship';
    transaction_id?: string;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({ ...input, status: 'completed' })
      .select('*')
      .single();
    if (error) throw error;
    await this.markInvoicePaid(input.invoice_id);
    return data as Payment;
  },

  async getScholarships(studentId?: string): Promise<Scholarship[]> {
    let q = supabase.from('scholarships').select('*');
    if (studentId) q = q.eq('student_id', studentId);
    q = q.order('awarded_at', { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data as Scholarship[]) ?? [];
  },

  async createScholarship(input: {
    student_id: string;
    name_en: string;
    name_fa: string;
    name_ps: string;
    amount: number;
  }): Promise<Scholarship> {
    const { data, error } = await supabase
      .from('scholarships')
      .insert({ ...input, status: 'active' })
      .select('*')
      .single();
    if (error) throw error;
    return data as Scholarship;
  },
};

// ============================================================
// SUPPORT TICKET SERVICE
// ============================================================

export const ticketService = {
  async getStudentTickets(studentId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as SupportTicket[]) ?? [];
  },

  async getAllTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as SupportTicket[]) ?? [];
  },

  async createTicket(input: {
    student_id: string;
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<SupportTicket> {
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ ...input, ticket_number: ticketNumber, priority: input.priority ?? 'medium' })
      .select('*')
      .single();
    if (error) throw error;
    return data as SupportTicket;
  },

  async updateTicketStatus(id: string, status: SupportTicket['status'], assignedTo?: string): Promise<void> {
    const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (assignedTo !== undefined) update.assigned_to = assignedTo;
    const { error } = await supabase
      .from('support_tickets')
      .update(update)
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// AUDIT LOG SERVICE
// ============================================================

export const auditService = {
  async log(input: {
    user_id?: string | null;
    action: string;
    entity_type?: string;
    entity_id?: string;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
  }): Promise<void> {
    const { error } = await supabase.from('audit_logs').insert({
      ...input,
      ip_address: '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
    if (error) console.error('Audit log failed:', error.message);
  },

  async getLogs(limit = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as AuditLog[]) ?? [];
  },
};

// ============================================================
// ACADEMIC SERVICE — departments, calendar, syllabi
// ============================================================

export const academicService = {
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name_en');
    if (error) throw error;
    return (data as Department[]) ?? [];
  },

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('academic_calendar')
      .select('*')
      .order('start_date');
    if (error) throw error;
    return (data as CalendarEvent[]) ?? [];
  },

  async getSyllabi(courseId: string): Promise<Syllabus[]> {
    const { data, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('course_id', courseId)
      .order('week_number');
    if (error) throw error;
    return (data as Syllabus[]) ?? [];
  },
};

// ============================================================
// USER MANAGEMENT SERVICE — admin CRUD on profiles
// ============================================================

export const userService = {
  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Profile[]) ?? [];
  },

  async updateUserRole(userId: string, role: Profile['role']): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateUserProfile(userId: string, updates: { full_name?: string; bio?: string; avatar_url?: string }): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async searchUsers(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${query}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Profile[]) ?? [];
  },
};

// ============================================================
// LOCALIZATION HELPERS
// ============================================================

export function localizedField<T extends Record<string, unknown>>(
  obj: T, field: string, lang: Lang
): string {
  const key = `${field}_${lang}`;
  return (obj[key] as string) || (obj[`${field}_en`] as string) || '';
}
