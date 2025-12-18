import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Subtask } from '@/types/todo';

export function useSubtasks() {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});

  const fetchSubtasks = useCallback(async (todoId: string) => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('todo_id', todoId)
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching subtasks:', error);
      return [];
    }

    const mapped: Subtask[] = (data || []).map(s => ({
      id: s.id,
      todoId: s.todo_id,
      title: s.title,
      completed: s.completed,
      order: s.sort_order,
    }));

    setSubtasks(prev => ({ ...prev, [todoId]: mapped }));
    return mapped;
  }, [user]);

  const addSubtask = useCallback(async (todoId: string, title: string) => {
    if (!user || !title.trim()) return;

    const currentSubtasks = subtasks[todoId] || [];
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        todo_id: todoId,
        user_id: user.id,
        title: title.trim(),
        sort_order: currentSubtasks.length,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding subtask:', error);
      return;
    }

    const newSubtask: Subtask = {
      id: data.id,
      todoId: data.todo_id,
      title: data.title,
      completed: data.completed,
      order: data.sort_order,
    };

    setSubtasks(prev => ({
      ...prev,
      [todoId]: [...(prev[todoId] || []), newSubtask],
    }));
  }, [user, subtasks]);

  const toggleSubtask = useCallback(async (todoId: string, subtaskId: string) => {
    const todoSubtasks = subtasks[todoId] || [];
    const subtask = todoSubtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const { error } = await supabase
      .from('subtasks')
      .update({ completed: !subtask.completed })
      .eq('id', subtaskId);

    if (error) {
      console.error('Error toggling subtask:', error);
      return;
    }

    setSubtasks(prev => ({
      ...prev,
      [todoId]: prev[todoId].map(s =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
    }));
  }, [subtasks]);

  const deleteSubtask = useCallback(async (todoId: string, subtaskId: string) => {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) {
      console.error('Error deleting subtask:', error);
      return;
    }

    setSubtasks(prev => ({
      ...prev,
      [todoId]: prev[todoId].filter(s => s.id !== subtaskId),
    }));
  }, []);

  const getSubtasks = useCallback((todoId: string) => {
    return subtasks[todoId] || [];
  }, [subtasks]);

  const getSubtaskProgress = useCallback((todoId: string) => {
    const todoSubtasks = subtasks[todoId] || [];
    if (todoSubtasks.length === 0) return null;
    
    const completed = todoSubtasks.filter(s => s.completed).length;
    return {
      total: todoSubtasks.length,
      completed,
      percentage: Math.round((completed / todoSubtasks.length) * 100),
    };
  }, [subtasks]);

  return {
    subtasks,
    fetchSubtasks,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    getSubtasks,
    getSubtaskProgress,
  };
}
