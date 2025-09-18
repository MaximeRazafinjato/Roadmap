export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role?: string;
  createdAt: string;
  updatedAt?: string;
  fullName: string;
}

export interface UpdateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean | null;
  role?: string | null;
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
}
