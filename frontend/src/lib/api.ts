import { AuthResponse, LoginCredentials, User } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success) {
      this.setToken(response.accessToken);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getDashboardData(role: string): Promise<any> {
    return this.request(`/dashboard/${role}`);
  }

  async getPatients(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/patients${queryString}`);
  }

  async getPatientById(id: string): Promise<any> {
    return this.request(`/patients/${id}`);
  }

  async createPatient(data: any): Promise<any> {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: any): Promise<any> {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async searchPatients(query: string): Promise<any> {
    return this.request(`/patients/search?query=${encodeURIComponent(query)}`);
  }

  async getAppointments(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/appointments${queryString}`);
  }

  async getTodayAppointments(): Promise<any> {
    return this.request('/appointments/today');
  }

  async getAppointmentById(id: string): Promise<any> {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(data: any): Promise<any> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: any): Promise<any> {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(id: string, status: string): Promise<any> {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAppointment(id: string): Promise<any> {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async getDoctorQueue(doctorId: string): Promise<any> {
    return this.request(`/appointments/queue/${doctorId}`);
  }

  async getPrescriptions(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/prescriptions${queryString}`);
  }

  async getPendingPrescriptions(): Promise<any> {
    return this.request('/prescriptions/pending');
  }

  async createPrescription(data: any): Promise<any> {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrescription(id: string, data: any): Promise<any> {
    return this.request(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async dispenseMedication(id: string, data: any): Promise<any> {
    return this.request(`/prescriptions/${id}/dispense`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTestOrders(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/test-orders${queryString}`);
  }

  async getPendingTestOrders(): Promise<any> {
    return this.request('/test-orders/pending');
  }

  async getCompletedTestOrders(): Promise<any> {
    return this.request('/test-orders/completed');
  }

  async createTestOrder(data: any): Promise<any> {
    return this.request('/test-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestResults(id: string, data: any): Promise<any> {
    return this.request(`/test-orders/${id}/results`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async markTestAsReviewed(id: string, notes?: string): Promise<any> {
    return this.request(`/test-orders/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  async getInventoryItems(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/inventory${queryString}`);
  }

  async getLowStockItems(): Promise<any> {
    return this.request('/inventory/alerts/low-stock');
  }

  async getExpiringItems(): Promise<any> {
    return this.request('/inventory/alerts/expiring');
  }

  async createInventoryItem(data: any): Promise<any> {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reduceStock(id: string, quantity: number): Promise<any> {
    return this.request(`/inventory/${id}/reduce-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  async searchInventoryItems(query: string): Promise<any> {
    return this.request(`/inventory/search?query=${encodeURIComponent(query)}`);
  }

  async getEquipment(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/equipment${queryString}`);
  }

  async getEquipmentById(id: string): Promise<any> {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(data: any): Promise<any> {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: string, data: any): Promise<any> {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateEquipmentMaintenance(id: string, data: any): Promise<any> {
    return this.request(`/equipment/${id}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEquipmentStats(): Promise<any> {
    return this.request('/equipment/stats/overview');
  }

  async getInvoices(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/billing/invoices${queryString}`);
  }

  async getInvoiceById(id: string): Promise<any> {
    return this.request(`/billing/invoices/${id}`);
  }

  async createInvoice(data: any): Promise<any> {
    return this.request('/billing/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordPayment(invoiceId: string, data: any): Promise<any> {
    return this.request(`/billing/invoices/${invoiceId}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBillingStats(): Promise<any> {
    return this.request('/billing/stats');
  }

  async uploadTestReport(testOrderId: string, formData: FormData): Promise<any> {
    const url = `${this.baseURL}/test-orders/${testOrderId}/upload-report`;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  async downloadTestReport(testOrderId: string): Promise<void> {
    const url = `${this.baseURL}/test-orders/${testOrderId}/download-report`;
    
    const config: RequestInit = {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `test-report-${testOrderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  async getTestReport(testOrderId: string): Promise<any> {
    return this.request(`/test-orders/${testOrderId}/report`);
  }

  async getStorageStats(): Promise<any> {
    return this.request('/data-management/storage-stats');
  }

  async getBackups(): Promise<any> {
    return this.request('/data-management/backups');
  }

  async createBackup(data: { type?: string; includeFiles?: boolean } = {}): Promise<any> {
    return this.request('/data-management/backups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteBackup(backupId: string): Promise<any> {
    return this.request(`/data-management/backups/${backupId}`, {
      method: 'DELETE',
    });
  }

  async exportData(data: {
    dataType?: string;
    format?: string;
    dateRange?: { start: string; end: string };
  }): Promise<any> {
    return this.request('/data-management/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async downloadExportedFile(filename: string): Promise<void> {
    const url = `${this.baseURL}/data-management/download/${filename}`;
    
    const config: RequestInit = {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('File download failed:', error);
      throw error;
    }
  }

  async getRetentionSettings(): Promise<any> {
    return this.request('/data-management/retention');
  }

  async updateRetentionSettings(settings: any): Promise<any> {
    return this.request('/data-management/retention', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getUserActivity(userId: string, params?: {
    days?: number;
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    success?: boolean;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/users/${userId}/activity${queryString}`);
  }

  async getUserBehavior(userId: string, days = 30): Promise<any> {
    return this.request(`/users/${userId}/behavior?days=${days}`);
  }

  async getUserSessions(userId: string, params?: {
    active?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/users/${userId}/sessions${queryString}`);
  }

  async getDoctors(): Promise<any> {
    return this.request('/users/doctors');
  }

  async getHospitalSettings(): Promise<any> {
    return this.request('/settings/hospital');
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient;