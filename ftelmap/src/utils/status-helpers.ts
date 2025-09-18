// Helper functions for project status conversion

export const getStatusLabel = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Planning',
    1: 'InProgress',
    2: 'OnHold',
    3: 'Completed',
    4: 'Cancelled',
  };
  return statusMap[status] || 'Unknown';
};

export const getStatusValue = (label: string): number => {
  const labelMap: Record<string, number> = {
    Planning: 0,
    InProgress: 1,
    OnHold: 2,
    Completed: 3,
    Cancelled: 4,
  };
  return labelMap[label] ?? 0;
};
