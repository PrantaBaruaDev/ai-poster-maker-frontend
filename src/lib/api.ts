import type {
  ApiResponse,
  PosterDetail,
  PosterFormData,
  PosterListItem,
  TemplateDetail,
  TemplateListItem,
  User,
} from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T; meta?: ApiResponse<T> extends { meta?: infer M } ? M : undefined }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",        // ← send httpOnly cookies
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  // 204 No Content
  if (res.status === 204) {
    return { data: undefined as T };
  }

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    const message =
      (json as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new HttpError(res.status, message, json);
  }

  return {
    data: (json as { data: T }).data,
    meta: (json as { meta?: unknown }).meta as never,
  };
}

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: User }>("/auth/me"),

  logout: () => request<{ message?: string }>("/auth/logout", { method: "POST" }),

  refresh: () => request<{ user: User }>("/auth/refresh", { method: "POST" }),
};

export const templateApi = {
  list: (occasion?: string) => {
    const qs = occasion ? `?occasion=${occasion}` : "";
    return request<{ templates: TemplateListItem[] }>(`/templates${qs}`);
  },

  getById: (id: string) => request<{ template: TemplateDetail }>(`/templates/${id}`),
};

export const uploadApi = {
  uploadPhoto: async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      credentials: "include",
      body: form,   // ← browser sets multipart Content-Type automatically
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new HttpError(res.status, json.message ?? "Upload failed", json);
    }
    return json.data as {
      url: string;
      publicId: string;
      width: number;
      height: number;
      bytes: number;
      format: string;
    };
  },
};

export const posterApi = {
  create: (body: {
    templateId: string;
    formData: PosterFormData;
    photoUrls: string[];
  }) =>
    request<{ posterId: string; status: string }>("/posters", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getById: (id: string) => request<{ poster: PosterDetail }>(`/posters/${id}`),

  history: (page = 1, limit = 10) =>
    request<{ posters: PosterListItem[] }>(`/posters/me?page=${page}&limit=${limit}`),

  regenerate: (id: string, body: { formData?: Partial<PosterFormData> } = {}) =>
    request<{ posterId: string; status: string }>(`/posters/${id}/regenerate`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<void>(`/posters/${id}`, { method: "DELETE" }),
};