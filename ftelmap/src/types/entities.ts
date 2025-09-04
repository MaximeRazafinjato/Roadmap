// Base entity
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
}

// User entity
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: string;
  projects?: Project[];
}

// Timeline position enum
export const TimelinePosition = {
  Top: 0,
  Bottom: 1
} as const;

export type TimelinePositionType = typeof TimelinePosition[keyof typeof TimelinePosition];

// Project entity
export interface Project extends BaseEntity {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  textColor: string;
  position: TimelinePositionType;
  ownerId: string;
  owner?: User;
}


// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface CreateProjectForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  textColor: string;
  position: TimelinePositionType;
  ownerId: string;
}

export interface UpdateProjectForm extends CreateProjectForm {
  id: string;
}