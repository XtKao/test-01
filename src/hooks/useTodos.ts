import { useState, useEffect, useCallback } from 'react';
import { Todo, Priority, FilterType, SortType, Category, DEFAULT_CATEGORIES } from '@/types/todo';

const STORAGE_KEY = 'modern-todos';
const CATEGORIES_KEY = 'modern-todo-categories';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((todo: Todo, index: number) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime) : undefined,
        order: todo.order ?? index,
      }));
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_CATEGORIES;
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('priority');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  const addTodo = useCallback((
    title: string,
    priority: Priority = 'medium',
    description?: string,
    dueDate?: Date,
    reminderTime?: Date,
    categoryId?: string
  ) => {
    const newTodo: Todo = {
      id: generateId(),
      title,
      description,
      completed: false,
      priority,
      categoryId,
      dueDate,
      reminderTime,
      createdAt: new Date(),
      notified: false,
      order: todos.length,
    };
    setTodos(prev => [newTodo, ...prev]);
  }, [todos.length]);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  }, []);

  const reorderTodos = useCallback((activeId: string, overId: string) => {
    setTodos(prev => {
      const oldIndex = prev.findIndex(t => t.id === activeId);
      const newIndex = prev.findIndex(t => t.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newTodos = [...prev];
      const [removed] = newTodos.splice(oldIndex, 1);
      newTodos.splice(newIndex, 0, removed);
      
      return newTodos.map((todo, index) => ({ ...todo, order: index }));
    });
  }, []);

  const markAsNotified = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, notified: true } : todo
      )
    );
  }, []);

  const addCategory = useCallback((name: string, color: string, icon: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      color,
      icon,
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTodos(prev => prev.map(todo => 
      todo.categoryId === id ? { ...todo, categoryId: undefined } : todo
    ));
  }, []);

  const getPriorityWeight = (priority: Priority): number => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (filter === 'active' && todo.completed) return false;
      if (filter === 'completed' && !todo.completed) return false;
      if (categoryFilter && todo.categoryId !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'manual') {
        return a.order - b.order;
      }
      if (sortBy === 'priority') {
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return {
    todos: filteredAndSortedTodos,
    allTodos: todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    reorderTodos,
    markAsNotified,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    categoryFilter,
    setCategoryFilter,
    categories,
    addCategory,
    deleteCategory,
    stats,
  };
}
