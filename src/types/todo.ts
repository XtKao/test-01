export type Priority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export interface Subtask {
  id: string;
  todoId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId?: string;
  dueDate?: Date;
  reminderTime?: Date;
  createdAt: Date;
  notified?: boolean;
  order: number;
  subtasks?: Subtask[];
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  recurrenceDays?: string[];
  recurrenceEndDate?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'priority' | 'dueDate' | 'createdAt' | 'manual';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'งานออฟฟิศ', color: 'hsl(220, 90%, 56%)', icon: '💼' },
  { id: 'home', name: 'งานบ้าน', color: 'hsl(160, 84%, 39%)', icon: '🏠' },
  { id: 'personal', name: 'งานส่วนตัว', color: 'hsl(280, 70%, 55%)', icon: '👤' },
  { id: 'shopping', name: 'ช้อปปิ้ง', color: 'hsl(35, 100%, 55%)', icon: '🛒' },
  { id: 'health', name: 'สุขภาพ', color: 'hsl(0, 84%, 60%)', icon: '❤️' },
];
