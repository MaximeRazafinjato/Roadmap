// Enums
export enum Department {
  Front = 'Front',
  Back = 'Back',
  Infra = 'Infra',
  Commerce = 'Commerce',
}

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
  steps?: Step[];
}

// Step entity
export interface Step extends BaseEntity {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  textColor: string;
  associatedDepartments: Department[];
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
export interface CreateStepForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  textColor: string;
  associatedDepartments: Department[];
  ownerId: string;
}

export interface UpdateStepForm extends CreateStepForm {
  id: string;
}
