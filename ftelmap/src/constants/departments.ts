import { Department } from '../types/entities';

export interface DepartmentOption {
  value: Department;
  label: string;
  color: string;
}

export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  {
    value: Department.Front,
    label: 'Pôle Front',
    color: '#2196F3', // Bleu
  },
  {
    value: Department.Back,
    label: 'Pôle Back',
    color: '#4CAF50', // Vert
  },
  {
    value: Department.Infra,
    label: 'Pôle Infra',
    color: '#FF9800', // Orange
  },
  {
    value: Department.Commerce,
    label: 'Pôle Commerce',
    color: '#9C27B0', // Violet
  },
];

export const getDepartmentLabel = (department: Department): string => {
  const option = DEPARTMENT_OPTIONS.find((opt) => opt.value === department);
  return option?.label || department;
};

export const getDepartmentColor = (department: Department): string => {
  const option = DEPARTMENT_OPTIONS.find((opt) => opt.value === department);
  return option?.color || '#757575';
};

export const getDepartmentAcronym = (department: Department): string => {
  const acronyms: Record<Department, string> = {
    [Department.Front]: 'F',
    [Department.Back]: 'B',
    [Department.Infra]: 'I',
    [Department.Commerce]: 'C',
  };
  return acronyms[department] || department;
};
