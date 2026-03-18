import type {
  Category,
  Exercise,
  Template,
  WorkoutSet,
  CategoryFormData,
  ExerciseFormData,
  TemplateFormData,
  SetFormData,
  SetFilters,
  AuthResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as T[];
  if (Array.isArray(obj.results)) return obj.results as T[];
  if (Array.isArray(obj.data)) return obj.data as T[];

  return [];
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorObj = error as {
        message?: string;
        detail?: string;
        error?: { message?: string };
      };
      throw new Error(
        errorObj.error?.message || errorObj.message || errorObj.detail || `HTTP ${response.status}`,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth
  async authTelegram(initData: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/telegram/', {
      method: 'POST',
      body: JSON.stringify({ init_data: initData }),
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await this.request<unknown>('/categories/');
    return normalizeListResponse<Category>(res);
  }

  async getCategory(id: string | number): Promise<Category> {
    return this.request<Category>(`/categories/${id}/`);
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    return this.request<Category>('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string | number, data: CategoryFormData): Promise<Category> {
    return this.request<Category>(`/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string | number): Promise<void> {
    return this.request<void>(`/categories/${id}/`, {
      method: 'DELETE',
    });
  }

  // Exercises
  async getExercises(categoryId?: string | number): Promise<Exercise[]> {
    const params = categoryId ? `?category_id=${encodeURIComponent(String(categoryId))}` : '';
    const res = await this.request<unknown>(`/exercises/${params}`);
    return normalizeListResponse<Exercise>(res);
  }

  async getExercise(id: string | number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/`);
  }

  async createExercise(data: ExerciseFormData): Promise<Exercise> {
    const categoryId = data.category_id ?? data.category;
    return this.request<Exercise>('/exercises/', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        short: data.short,
        category_id: categoryId,
      }),
    });
  }

  async updateExercise(id: string | number, data: ExerciseFormData): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: data.title,
        short: data.short,
      }),
    });
  }

  async deleteExercise(id: string | number): Promise<void> {
    return this.request<void>(`/exercises/${id}/`, {
      method: 'DELETE',
    });
  }

  async archiveExercise(id: string | number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/archive/`, {
      method: 'POST',
    });
  }

  async restoreExercise(id: string | number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/restore/`, {
      method: 'POST',
    });
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    const res = await this.request<unknown>('/templates/');
    return normalizeListResponse<Template>(res);
  }

  async getTemplate(id: string | number): Promise<Template> {
    return this.request<Template>(`/templates/${id}/`);
  }

  async createTemplate(data: TemplateFormData): Promise<Template> {
    return this.request<Template>('/templates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string | number, data: TemplateFormData): Promise<Template> {
    return this.request<Template>(`/templates/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string | number): Promise<void> {
    return this.request<void>(`/templates/${id}/`, {
      method: 'DELETE',
    });
  }

  // Sets
  async getSets(filters?: SetFilters): Promise<WorkoutSet[]> {
    const params = new URLSearchParams();
    if (filters?.exercise_id) {
      params.append('exercise_id', filters.exercise_id.toString());
    }
    if (filters?.created_from) {
      params.append('created_from', filters.created_from);
    }
    if (filters?.created_to) {
      params.append('created_to', filters.created_to);
    }
    const queryString = params.toString();
    const res = await this.request<unknown>(`/sets/${queryString ? `?${queryString}` : ''}`);
    return normalizeListResponse<WorkoutSet>(res);
  }

  async getSet(id: string | number): Promise<WorkoutSet> {
    return this.request<WorkoutSet>(`/sets/${id}/`);
  }

  async createSet(data: SetFormData): Promise<WorkoutSet> {
    return this.request<WorkoutSet>('/sets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSet(id: string | number, data: Partial<SetFormData>): Promise<WorkoutSet> {
    return this.request<WorkoutSet>(`/sets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSet(id: string | number): Promise<void> {
    return this.request<void>(`/sets/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
export default api;
