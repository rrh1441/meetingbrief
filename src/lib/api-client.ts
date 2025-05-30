import { authClient } from './auth-client';

// Secure API client that adds JWT token to all requests
class SecureAPIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await authClient.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    return headers;
  }

  async get(endpoint: string): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });
  }

  async post(endpoint: string, data?: Record<string, unknown>): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: Record<string, unknown>): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
  }
}

export const apiClient = new SecureAPIClient(); 