import { api } from "./axios";

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectCreate {
  organization_id: string; // The backend usually expects this inside the payload as per our V1 schemas
  name: string;
  slug: string;
  description?: string;
}

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    // In V1, the endpoint GET /projects returns projects visible to user (by checking their org)
    const response = await api.get<Project[]>("/projects");
    return response.data;
  },
  
  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await api.post<Project>("/projects", data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<ProjectCreate>): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  }
};
