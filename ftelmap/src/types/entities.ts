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

// Project status enum
export enum ProjectStatus {
  Planning = 0,
  InProgress = 1,
  OnHold = 2,
  Completed = 3,
  Cancelled = 4
}

// Project entity
export interface Project extends BaseEntity {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  budget: number;
  ownerId: string;
  owner?: User;
  tasks?: Task[];
  milestones?: Milestone[];
}

// Task priority enum
export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

// Task status enum
export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Review = 2,
  Done = 3,
  Blocked = 4
}

// Task entity
export interface Task extends BaseEntity {
  title: string;
  description: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
  projectId: string;
  assignedToId?: string;
  project?: Project;
  assignedTo?: User;
}

// Milestone entity
export interface Milestone extends BaseEntity {
  name: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  isCompleted: boolean;
  projectId: string;
  project?: Project;
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
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  budget: number;
  ownerId: string;
}

export interface UpdateProjectForm extends CreateProjectForm {
  id: string;
}

export interface CreateTaskForm {
  title: string;
  description: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  projectId: string;
  assignedToId?: string;
}

export interface UpdateTaskForm extends CreateTaskForm {
  id: string;
  actualHours: number;
}

export interface CreateMilestoneForm {
  name: string;
  description: string;
  targetDate: string;
  projectId: string;
}

export interface UpdateMilestoneForm extends CreateMilestoneForm {
  id: string;
  completedDate?: string;
  isCompleted: boolean;
}