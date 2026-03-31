import { api } from "./axios";

export interface ReleaseAsset {
  id: string;
  release_id: string;
  asset_type: string;
  original_file_name: string;
  file_size_bytes: number;
  created_at: string;
}

export interface Release {
  id: string;
  project_id: string;
  version: string;
  version_normalized: string;
  release_notes?: string;
  is_published: boolean;
  is_current: boolean;
  published_at?: string;
  created_at: string;
  assets?: ReleaseAsset[];
}

export interface ReleaseCreate {
  version: string;
  version_normalized: string;
  release_notes?: string;
}

export const releasesApi = {
  listByProject: async (project_id: string): Promise<Release[]> => {
    const response = await api.get<Release[]>(`/projects/${project_id}/releases`);
    return response.data;
  },
  
  create: async (project_id: string, data: ReleaseCreate): Promise<Release> => {
    const response = await api.post<Release>(`/projects/${project_id}/releases`, data);
    return response.data;
  },
  
  uploadAsset: async (release_id: string, file: File, onUploadProgress?: (progressEvent: any) => void): Promise<ReleaseAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ReleaseAsset>(`/releases/${release_id}/asset`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data;
  },
  
  publish: async (release_id: string): Promise<Release> => {
    const response = await api.post<Release>(`/releases/${release_id}/publish`);
    return response.data;
  }
};
