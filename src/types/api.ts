export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
}

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
  meta?: Meta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type OccasionType =
  | "VICTORY"
  | "MOURNING"
  | "CAMPAIGN"
  | "GREETINGS"
  | "FESTIVAL";

export interface TemplateListItem {
  id: string;
  slug: string;
  title: string;
  occasionType: OccasionType;
  thumbnailUrl: string;
}

export interface TemplateDetail extends TemplateListItem {
  htmlTemplateKey: string;
  layoutConfig: {
    canvas: { width: number; height: number };
    photoSlots: Array<{
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      shape?: "rect" | "circle";
    }>;
    textSlots: Record<string, unknown>;
    colorScheme: {
      primary: string;
      accent: string;
      text: string;
      background: string;
    };
  };
  isActive: boolean;
  createdAt: string;
}

export type PosterStatus = "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";

export interface PosterFormData {
  name: string;
  designation: string;
  party: string;
  district?: string;
  headline: string;
  subheadline?: string;
  slogan?: string;
  tribute?: string;
}

export interface PosterListItem {
  id: string;
  status: PosterStatus;
  generatedImageUrl: string | null;
  createdAt: string;
  formData: PosterFormData;
}

export interface PosterDetail {
  id: string;
  status: PosterStatus;
  generatedImageUrl: string | null;
  retryCount: number;
  errorMessage: string | null;
  formData: PosterFormData;
  template?: {
    id: string;
    title: string;
    occasionType: OccasionType;
  };
}


export interface AdminTemplateListItem {
  id: string;
  slug: string;
  title: string;
  occasionType: OccasionType;
  thumbnailUrl: string;
  htmlTemplateKey: string;
  layoutConfig: TemplateDetail["layoutConfig"];
  isActive: boolean;
  createdAt: string;
  _count: { posters: number };
}

export interface CreateTemplateBody {
  slug: string;
  title: string;
  occasionType: OccasionType;
  thumbnailUrl: string;
  htmlTemplateKey: string;
  layoutConfig: TemplateDetail["layoutConfig"];
  isActive?: boolean;
}

export type UpdateTemplateBody = Partial<Omit<CreateTemplateBody, "slug">>;

export interface AdminPosterListItem {
  id: string;
  status: PosterStatus;
  isFlagged: boolean;
  generatedImageUrl: string | null;
  formData: PosterFormData;
  createdAt: string;
  user: { id: string; name: string; email: string };
  template: { id: string; title: string; occasionType: OccasionType };
}