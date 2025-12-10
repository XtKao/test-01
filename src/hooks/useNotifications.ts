import { useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { toast } from '@/hooks/use-toast';

export function useNotifications(
  todos: Todo[],
  markAsNotified: (id: string) => void
) {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback((todo: Todo) => {
    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(`${priorityEmoji[todo.priority]} Task Reminder`, {
        body: todo.title,
        icon: '/favicon.ico',
        tag: todo.id,
      });
    }

    // In-app toast notification
    toast({
      title: `${priorityEmoji[todo.priority]} เตือนความจำ!`,
      description: todo.title,
      duration: 10000,
    });
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      todos.forEach(todo => {
        if (
          todo.reminderTime &&
          !todo.completed &&
          !todo.notified &&
          new Date(todo.reminderTime) <= now
        ) {
          sendNotification(todo);
          markAsNotified(todo.id);
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [todos, markAsNotified, sendNotification]);

  return { requestPermission };
}
