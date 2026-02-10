import { useEffect } from 'react';

interface ShortcutConfig {
  onNewTodo?: () => void;
  onSearch?: () => void;
  onToggleTheme?: () => void;
}

export function useKeyboardShortcuts({ onNewTodo, onSearch, onToggleTheme }: ShortcutConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && e.key === 'n') {
        e.preventDefault();
        onNewTodo?.();
      }

      if (isCtrlOrMeta && e.key === '/') {
        e.preventDefault();
        onSearch?.();
      }

      if (isCtrlOrMeta && e.key === 'd') {
        e.preventDefault();
        onToggleTheme?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTodo, onSearch, onToggleTheme]);
}
