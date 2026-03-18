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
      throw new Error(error.message || error.detail || `HTTP ${response.status}`);
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
    return this.request<Category[]>('/categories/');
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/categories/${id}/`);
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    return this.request<Category>('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: CategoryFormData): Promise<Category> {
    return this.request<Category>(`/categories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}/`, {
      method: 'DELETE',
    });
  }

  // Exercises
  async getExercises(categoryId?: number): Promise<Exercise[]> {
    const params = categoryId ? `?category=${categoryId}` : '';
    return this.request<Exercise[]>(`/exercises/${params}`);
  }

  async getExercise(id: number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/`);
  }

  async createExercise(data: ExerciseFormData): Promise<Exercise> {
    return this.request<Exercise>('/exercises/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExercise(id: number, data: ExerciseFormData): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExercise(id: number): Promise<void> {
    return this.request<void>(`/exercises/${id}/`, {
      method: 'DELETE',
    });
  }

  async archiveExercise(id: number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/archive/`, {
      method: 'POST',
    });
  }

  async restoreExercise(id: number): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}/restore/`, {
      method: 'POST',
    });
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return this.request<Template[]>('/templates/');
  }

  async getTemplate(id: number): Promise<Template> {
    return this.request<Template>(`/templates/${id}/`);
  }

  async createTemplate(data: TemplateFormData): Promise<Template> {
    return this.request<Template>('/templates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: number, data: TemplateFormData): Promise<Template> {
    return this.request<Template>(`/templates/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: number): Promise<void> {
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
    return this.request<WorkoutSet[]>(`/sets/${queryString ? `?${queryString}` : ''}`);
  }

  async getSet(id: number): Promise<WorkoutSet> {
    return this.request<WorkoutSet>(`/sets/${id}/`);
  }

  async createSet(data: SetFormData): Promise<WorkoutSet> {
    return this.request<WorkoutSet>('/sets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSet(id: number, data: Partial<SetFormData>): Promise<WorkoutSet> {
    return this.request<WorkoutSet>(`/sets/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSet(id: number): Promise<void> {
    return this.request<void>(`/sets/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
export default api;
