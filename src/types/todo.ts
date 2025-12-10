export type Priority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  reminderTime?: Date;
  createdAt: Date;
  notified?: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'priority' | 'dueDate' | 'createdAt';
