import { TodoInput } from '@/components/TodoInput';
import { TodoList } from '@/components/TodoList';
import { TodoFilters } from '@/components/TodoFilters';
import { TodoStats } from '@/components/TodoStats';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTodos } from '@/hooks/useTodos';
import { useNotifications } from '@/hooks/useNotifications';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const {
    todos,
    allTodos,
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
    stats,
  } = useTodos();

  useNotifications(allTodos, markAsNotified);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
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

        {/* Stats */}
        <div className="mb-8">
          <TodoStats stats={stats} />
        </div>

        {/* Input */}
        <div className="mb-6">
          <TodoInput onAdd={addTodo} categories={categories} />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={categoryFilter}
            onSelectCategory={setCategoryFilter}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TodoFilters
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            stats={stats}
          />
        </div>

        {/* Todo List */}
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
          onReorder={reorderTodos}
          categories={categories}
        />

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground space-y-2">
          <p>ลากที่ไอคอน ⋮⋮ เพื่อจัดลำดับงาน</p>
          <p>กดปุ่มถูกเพื่อทำเครื่องหมายงานที่เสร็จแล้ว</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
