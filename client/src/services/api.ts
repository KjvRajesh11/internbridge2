import {
  UserRole,
  Internship,
  Application,
  Interview,
  Profile,
  Company,
} from '../types/shared.js';

const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;
  private demoUserId: string = 's1000000-0000-0000-0000-000000000001'; // Default: Priya Sharma

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      const savedDemo = localStorage.getItem('demoUserId');
      if (savedDemo) this.demoUserId = savedDemo;
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  public setDemoUser(userId: string) {
    this.demoUserId = userId;
    localStorage.setItem('demoUserId', userId);
  }

  public getDemoUser(): string {
    return this.demoUserId;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.demoUserId) {
      headers['x-demo-user-id'] = this.demoUserId;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error: any = new Error(data.error || `HTTP error ${res.status}`);
      error.status = res.status;
      error.code = data.code;
      error.details = data.details;
      throw error;
    }

    return data;
  }

  // Auth
  public async getMe() {
    return this.request<{ success: boolean; user: any; company: any; preferences: any; availableProfiles: any[] }>(
      '/auth/me'
    );
  }

  public async switchUser(userId: string) {
    this.setDemoUser(userId);
    return this.request('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  public async login(email: string, passwordHash?: string) {
    const res = await this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash || 'demo-password' }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public async logout() {
    this.setToken(null);
    return this.request('/auth/logout', { method: 'POST' });
  }

  public async registerStudent(data: any) {
    return this.request('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async registerRecruiter(data: any) {
    return this.request('/auth/register/recruiter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Internships
  public async getInternships(params: { status?: string; search?: string; workMode?: string } = {}) {
    const q = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; internships: any[]; count: number }>(`/internships?${q}`);
  }

  public async getInternshipById(id: string) {
    return this.request<{ success: boolean; internship: any; hasApplied: boolean }>(`/internships/${id}`);
  }

  public async createInternship(data: any) {
    return this.request('/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateInternship(id: string, data: any) {
    return this.request(`/internships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async deleteInternship(id: string) {
    return this.request(`/internships/${id}`, { method: 'DELETE' });
  }

  // Applications
  public async getApplications(params: { status?: string; internship_id?: string } = {}) {
    const q = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; applications: any[]; count: number }>(`/applications?${q}`);
  }

  public async getApplicationById(id: string) {
    return this.request<{ success: boolean; application: any }>(`/applications/${id}`);
  }

  public async apply(data: { internship_id: string; cover_letter?: string; screening_answers?: any }) {
    return this.request<{ success: boolean; application: any; message: string }>('/applications/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateApplicationStatus(id: string, status: string, note?: string) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Student Endpoints
  public async getStudentDashboard() {
    return this.request<{
      success: boolean;
      metrics: any;
      recentApplications: any[];
      upcomingInterviews: any[];
      recommendedOpportunities: any[];
    }>('/students/dashboard');
  }

  public async getStudentProfile() {
    return this.request<{ success: boolean; profile: any }>('/students/profile');
  }

  public async updateStudentProfile(data: any) {
    return this.request('/students/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async getStudentPortfolio() {
    return this.request<{ success: boolean; portfolio: any }>('/students/portfolio');
  }

  public async addStudentSkill(data: any) {
    return this.request('/students/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async addStudentProject(data: any) {
    return this.request('/students/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Recruiter Endpoints
  public async getRecruiterDashboard() {
    return this.request<{
      success: boolean;
      company: any;
      metrics: any;
      pipelineStages: any;
      recentApplicants: any[];
    }>('/recruiters/dashboard');
  }

  public async getRecruiterApplicants(params: { internship_id?: string; status?: string } = {}) {
    const q = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; applicants: any[]; count: number; internships: any[] }>(
      `/recruiters/applicants?${q}`
    );
  }

  public async getRecruiterApplicantDetail(id: string) {
    return this.request<{ success: boolean; application: any; internship: any; student: any }>(
      `/recruiters/applicants/${id}`
    );
  }

  public async getRecruiterPipeline() {
    return this.request<{ success: boolean; pipeline: Record<string, any[]>; summary: any }>('/recruiters/pipeline');
  }

  public async getCompanyProfile() {
    return this.request<{ success: boolean; company: any }>('/recruiters/company');
  }

  public async updateCompanyProfile(data: any) {
    return this.request('/recruiters/company', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Interviews
  public async getInterviews() {
    return this.request<{ success: boolean; interviews: any[] }>('/interviews');
  }

  public async getInterviewById(id: string) {
    return this.request<{ success: boolean; interview: any }>(`/interviews/${id}`);
  }

  public async scheduleInterview(data: any) {
    return this.request('/interviews/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getSlots(params: { recruiter_id?: string; is_booked?: boolean } = {}) {
    const q = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; slots: any[] }>(`/interviews/slots?${q}`);
  }

  public async createSlot(data: any) {
    return this.request('/interviews/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async submitInterviewFeedback(id: string, data: any) {
    return this.request(`/interviews/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getInterviewPreparation(id: string) {
    return this.request<{ success: boolean; preparation: any }>(`/interviews/${id}/preparation`);
  }

  // AI Agents
  public async getAgentsStatus() {
    return this.request<{ success: boolean; agents: any[]; aiProvider: any; recentRuns: any[] }>('/agents/status');
  }

  public async getAgentRuns(params: { agent_type?: string; limit?: number } = {}) {
    const q = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; runs: any[] }>(`/agents/runs?${q}`);
  }

  public async triggerHunter(limit?: number) {
    return this.request<{ success: boolean; matches: any[]; count: number }>('/agents/hunter/discover', {
      method: 'POST',
      body: JSON.stringify({ limit }),
    });
  }

  public async generatePersonalization(data: { internship_id: string; type?: string; question?: string }) {
    return this.request<{ success: boolean; content: string }>('/agents/personalizer/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async runAutoApply() {
    return this.request<{ success: boolean; result: any }>('/agents/execution/auto-apply', {
      method: 'POST',
    });
  }

  public async validateGuard(internship_id: string) {
    return this.request<{ success: boolean; result: any }>('/agents/guard/validate', {
      method: 'POST',
      body: JSON.stringify({ internship_id }),
    });
  }

  public async evaluateMock(question: string, candidate_response: string) {
    return this.request<{ success: boolean; evaluation: any }>('/agents/career-ops/evaluate-mock', {
      method: 'POST',
      body: JSON.stringify({ question, candidate_response }),
    });
  }

  public async generateFollowUp(application_id: string) {
    return this.request<{ success: boolean; message: any }>('/agents/career-ops/follow-up', {
      method: 'POST',
      body: JSON.stringify({ application_id }),
    });
  }

  // Notifications
  public async getNotifications() {
    return this.request<{ success: boolean; notifications: any[]; unreadCount: number }>('/notifications');
  }

  public async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'POST' });
  }
}

export const api = new ApiClient();
export default api;
