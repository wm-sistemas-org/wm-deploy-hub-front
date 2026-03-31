import { api } from "./axios";

export interface User {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PasswordChangeBody {
  current_password: string;
  new_password: string;
}

export const authApi = {
  changePassword: async (body: PasswordChangeBody): Promise<{ detail: string }> => {
    const response = await api.post<{ detail: string }>("/auth/password-change", body);
    return response.data;
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post<TokenResponse>("/auth/login", formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  }
};
