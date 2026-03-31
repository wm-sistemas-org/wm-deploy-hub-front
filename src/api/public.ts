import { api } from "./axios";

export interface PublicReleaseInfo {
  organization: string;
  project: string;
  version: string;
  published_at: string;
  notes?: string;
  developer?: string;
  download_url: string;
  /** Present when the API includes file metadata */
  file_size_bytes?: number;
}

export const publicApi = {
  getLatestReleaseInfo: async (orgSlug: string, projectSlug: string): Promise<PublicReleaseInfo> => {
    const response = await api.get<PublicReleaseInfo>(`/public/${orgSlug}/${projectSlug}`);
    return response.data;
  },

  getOrganizationReleases: async (orgSlug: string): Promise<PublicReleaseInfo[]> => {
    const response = await api.get<PublicReleaseInfo[]>(`/public/${orgSlug}/projects`);
    return response.data;
  },

  getDownloadUrl: (orgSlug: string, projectSlug: string): string => {
    const base = (api.defaults.baseURL ?? '').replace(/\/$/, '');
    return `${base}/public/${orgSlug}/${projectSlug}/download`;
  }
};
