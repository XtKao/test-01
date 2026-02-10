import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { TodoFilters } from '@/components/TodoFilters';
import { TodoStats } from '@/components/TodoStats';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { CalendarView } from '@/components/CalendarView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { SearchInput } from '@/components/SearchInput';
import { ExportImport } from '@/components/ExportImport';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useTodos } from '@/hooks/useTodos';
import { useSubtasks } from '@/hooks/useSubtasks';
import { useAttachments } from '@/hooks/useAttachments';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';
import { Sparkles, ListTodo, Calendar, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('todos');
  const todoInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    todos, allTodos, loading: todosLoading,
    addTodo, toggleTodo, deleteTodo, updateTodo, reorderTodos, markAsNotified,
    filter, setFilter, sortBy, setSortBy,
    categoryFilter, setCategoryFilter,
    searchQuery, setSearchQuery,
    categories, addCategory, updateCategory, deleteCategory,
    totalStats, filteredStats, categoryStats, importTodos,
  } = useTodos();

  const { subtasks, fetchSubtasks, addSubtask, toggleSubtask, deleteSubtask } = useSubtasks();
  const { attachments, fetchAttachments, uploadAttachment, deleteAttachment } = useAttachments();

  useNotifications(allTodos, markAsNotified);

  const handleNewTodo = useCallback(() => {
    todoInputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useKeyboardShortcuts({
    onNewTodo: handleNewTodo,
    onSearch: handleSearch,
    onToggleTheme: handleToggleTheme,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-gentle" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Top Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5">
        <KeyboardShortcutsHelp />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            จัดการงานอย่างมืออาชีพ
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            รายการสิ่งที่ต้องทำ
          </h1>
          <p className="text-muted-foreground">
            จัดลำดับความสำคัญ ตั้งเวลาแจ้งเตือน ไม่พลาดทุกงาน
          </p>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
            <TabsList className="grid grid-cols-3 w-auto">
              <TabsTrigger value="todos" className="flex items-center gap-2 px-4">
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">รายการ</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2 px-4">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">ปฏิทิน</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4" onClick={() => navigate('/dashboard')}>
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <ExportImport
                todos={allTodos}
                categories={categories}
                subtasks={subtasks}
                onImport={importTodos}
              />
              <CategoryManager
                categories={categories}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
              />
            </div>
          </div>

          <TabsContent value="todos" className="space-y-6 mt-0">
            <TodoStats stats={totalStats} />
            <TodoInput onAdd={addTodo} categories={categories} inputRef={todoInputRef} />
            <CategoryFilter
              categories={categories}
              selectedCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
              categoryStats={categoryStats}
            />
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ค้นหางาน... (Ctrl+/)"
              inputRef={searchInputRef}
            />
            <TodoFilters
              filter={filter}
              setFilter={setFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              stats={filteredStats}
            />
            {todosLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <TodoList
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
                onReorder={reorderTodos}
                categories={categories}
                subtasks={subtasks}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onFetchSubtasks={fetchSubtasks}
                attachments={attachments}
                onUploadAttachment={uploadAttachment}
                onDeleteAttachment={deleteAttachment}
                onFetchAttachments={fetchAttachments}
              />
            )}
            <footer className="text-center mt-12 text-sm text-muted-foreground space-y-2">
              <p>ลากที่ไอคอน ⋮⋮ เพื่อจัดลำดับงาน • <kbd className="px-1.5 py-0.5 text-xs bg-secondary rounded border border-border">Ctrl+N</kbd> เพิ่มงาน</p>
            </footer>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarView todos={allTodos} categories={categories} onAddTodo={addTodo} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
