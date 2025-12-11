import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Todo, Category } from '@/types/todo';
import { format, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Flag, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  todos: Todo[];
  categories: Category[];
}

const priorityConfig = {
  high: { label: 'สูง', color: 'text-destructive', bg: 'bg-destructive' },
  medium: { label: 'กลาง', color: 'text-warning', bg: 'bg-warning' },
  low: { label: 'ต่ำ', color: 'text-success', bg: 'bg-success' },
};

export function CalendarView({ todos, categories }: CalendarViewProps) {
  const todosWithDueDate = useMemo(() => {
    return todos.filter(todo => todo.dueDate);
  }, [todos]);

  const selectedDates = useMemo(() => {
    return todosWithDueDate.map(todo => todo.dueDate!);
  }, [todosWithDueDate]);

  const getTodosForDate = (date: Date) => {
    return todosWithDueDate.filter(todo => 
      todo.dueDate && isSameDay(todo.dueDate, date)
    );
  };

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  // Custom day content to show dots for days with todos
  const modifiers = useMemo(() => {
    const hasTodos: Date[] = [];
    const hasHighPriority: Date[] = [];
    const hasCompleted: Date[] = [];

    todosWithDueDate.forEach(todo => {
      if (todo.dueDate) {
        hasTodos.push(todo.dueDate);
        if (todo.priority === 'high' && !todo.completed) {
          hasHighPriority.push(todo.dueDate);
        }
        if (todo.completed) {
          hasCompleted.push(todo.dueDate);
        }
      }
    });

    return { hasTodos, hasHighPriority, hasCompleted };
  }, [todosWithDueDate]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-4 shadow-card">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          className="mx-auto pointer-events-auto"
          locale={th}
          modifiers={modifiers}
          modifiersClassNames={{
            hasTodos: 'has-todos',
            hasHighPriority: 'has-high-priority',
          }}
        />
      </div>

      {/* Todos List by Date */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">งานที่มีกำหนด</h3>
        
        {todosWithDueDate.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">ยังไม่มีงานที่กำหนดวัน</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todosWithDueDate
              .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
              .map(todo => {
                const category = getCategory(todo.categoryId);
                return (
                  <div
                    key={todo.id}
                    className={cn(
                      'glass rounded-xl p-4 transition-all',
                      todo.completed && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        priorityConfig[todo.priority].bg
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {todo.completed && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                          <span className={cn(
                            'font-medium text-foreground truncate',
                            todo.completed && 'line-through text-muted-foreground'
                          )}>
                            {todo.title}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            {format(todo.dueDate!, 'd MMMM yyyy', { locale: th })}
                          </span>
                          
                          {todo.reminderTime && (
                            <span className="text-primary">
                              ⏰ {format(todo.reminderTime, 'HH:mm')}
                            </span>
                          )}
                          
                          {category && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              {category.icon} {category.name}
                            </span>
                          )}
                          
                          <span className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                            priorityConfig[todo.priority].bg + '/10',
                            priorityConfig[todo.priority].color
                          )}>
                            <Flag className="h-3 w-3" />
                            {priorityConfig[todo.priority].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
