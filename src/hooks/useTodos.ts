import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Todo, Priority, FilterType, SortType, Category } from '@/types/todo';
import { toast } from 'sonner';

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('priority');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch todos from database
  const fetchTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
      toast.error('ไม่สามารถโหลดรายการได้');
    } else {
      const mappedTodos: Todo[] = (data || []).map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        completed: todo.completed,
        priority: todo.priority as Priority,
        categoryId: todo.category_id || undefined,
        dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
        reminderTime: todo.reminder_time ? new Date(todo.reminder_time) : undefined,
        createdAt: new Date(todo.created_at),
        notified: todo.notified || false,
        order: todo.sort_order,
      }));
      setTodos(mappedTodos);
    }
    setLoading(false);
  }, [user]);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      return;
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      const mappedCategories: Category[] = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      }));
      setCategories(mappedCategories);
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, [fetchTodos, fetchCategories]);

  const addTodo = useCallback(async (
    title: string,
    priority: Priority = 'medium',
    description?: string,
    dueDate?: Date,
    reminderTime?: Date,
    categoryId?: string
  ) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title,
        description,
        priority,
        category_id: categoryId,
        due_date: dueDate?.toISOString(),
        reminder_time: reminderTime?.toISOString(),
        sort_order: todos.length,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error);
      toast.error('ไม่สามารถเพิ่มรายการได้');
    } else if (data) {
      const newTodo: Todo = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        completed: data.completed,
        priority: data.priority as Priority,
        categoryId: data.category_id || undefined,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        reminderTime: data.reminder_time ? new Date(data.reminder_time) : undefined,
        createdAt: new Date(data.created_at),
        notified: data.notified || false,
        order: data.sort_order,
      };
      setTodos(prev => [newTodo, ...prev]);
      toast.success('เพิ่มงานสำเร็จ');
    }
  }, [user, todos.length]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) {
      console.error('Error toggling todo:', error);
    } else {
      setTodos(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      );
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      toast.error('ไม่สามารถลบรายการได้');
    } else {
      setTodos(prev => prev.filter(t => t.id !== id));
      toast.success('ลบงานสำเร็จ');
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate?.toISOString();
    if (updates.reminderTime !== undefined) dbUpdates.reminder_time = updates.reminderTime?.toISOString();
    if (updates.notified !== undefined) dbUpdates.notified = updates.notified;
    if (updates.order !== undefined) dbUpdates.sort_order = updates.order;

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      setTodos(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
    }
  }, []);

  const reorderTodos = useCallback(async (activeId: string, overId: string) => {
    const oldIndex = todos.findIndex(t => t.id === activeId);
    const newIndex = todos.findIndex(t => t.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newTodos = [...todos];
    const [removed] = newTodos.splice(oldIndex, 1);
    newTodos.splice(newIndex, 0, removed);
    
    const reorderedTodos = newTodos.map((todo, index) => ({ ...todo, order: index }));
    setTodos(reorderedTodos);

    // Update orders in database
    const updates = reorderedTodos.map(todo => 
      supabase.from('todos').update({ sort_order: todo.order }).eq('id', todo.id)
    );
    await Promise.all(updates);
  }, [todos]);

  const markAsNotified = useCallback(async (id: string) => {
    await updateTodo(id, { notified: true });
  }, [updateTodo]);

  // Category operations
  const addCategory = useCallback(async (name: string, color: string, icon: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        color,
        icon,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      toast.error('ไม่สามารถเพิ่มหมวดหมู่ได้');
    } else if (data) {
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
      };
      setCategories(prev => [...prev, newCategory]);
    }
  }, [user]);

  const updateCategory = useCallback(async (id: string, name: string, color: string, icon: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name, color, icon })
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
    } else {
      setCategories(prev =>
        prev.map(c => c.id === id ? { ...c, name, color, icon } : c)
      );
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      // Update todos with this category
      setTodos(prev => prev.map(todo => 
        todo.categoryId === id ? { ...todo, categoryId: undefined } : todo
      ));
    }
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
      // ค้นหาด้วยคำค้น
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = todo.title.toLowerCase().includes(query);
        const matchDescription = todo.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDescription) return false;
      }
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

  // กรอง todos ตามหมวดหมู่ก่อนคำนวณ stats
  const todosForStats = categoryFilter 
    ? todos.filter(t => t.categoryId === categoryFilter)
    : todos;

  const stats = {
    total: todosForStats.length,
    active: todosForStats.filter(t => !t.completed).length,
    completed: todosForStats.filter(t => t.completed).length,
  };

  return {
    todos: filteredAndSortedTodos,
    allTodos: todos,
    loading,
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
    searchQuery,
    setSearchQuery,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    stats,
    refreshTodos: fetchTodos,
  };
}
