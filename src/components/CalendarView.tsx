import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Todo, Category, Priority } from '@/types/todo';
import { format, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Flag, CheckCircle2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarViewProps {
  todos: Todo[];
  categories: Category[];
  onAddTodo?: (title: string, priority: Priority, categoryId?: string, dueDate?: Date, reminderTime?: Date) => void;
}

const priorityConfig = {
  high: { label: 'สูง', color: 'text-destructive', bg: 'bg-destructive' },
  medium: { label: 'กลาง', color: 'text-warning', bg: 'bg-warning' },
  low: { label: 'ต่ำ', color: 'text-success', bg: 'bg-success' },
};

export function CalendarView({ todos, categories, onAddTodo }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState<string>('');

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

  // Custom day content to show indicator for days with todos
  const modifiers = useMemo(() => {
    const hasTodos: Date[] = [];

    todosWithDueDate.forEach(todo => {
      if (todo.dueDate) {
        hasTodos.push(todo.dueDate);
      }
    });

    return { hasTodos };
  }, [todosWithDueDate]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
    setNewTodoTitle('');
    setNewTodoPriority('medium');
    setNewTodoCategory('');
  };

  const handleAddTodo = () => {
    if (!newTodoTitle.trim() || !selectedDate || !onAddTodo) return;
    
    onAddTodo(
      newTodoTitle.trim(),
      newTodoPriority,
      newTodoCategory || undefined,
      selectedDate,
      undefined
    );
    
    setIsDialogOpen(false);
    setNewTodoTitle('');
    setNewTodoPriority('medium');
    setNewTodoCategory('');
  };

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
          }}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Add Todo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              เพิ่มงานสำหรับวันที่ {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: th })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="todo-title">ชื่องาน</Label>
              <Input
                id="todo-title"
                placeholder="พิมพ์ชื่องาน..."
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTodo();
                }}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label>ความสำคัญ</Label>
              <Select value={newTodoPriority} onValueChange={(v) => setNewTodoPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-success" />
                      ต่ำ
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-warning" />
                      กลาง
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-destructive" />
                      สูง
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Select value={newTodoCategory} onValueChange={setNewTodoCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่ (ไม่บังคับ)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={handleAddTodo} 
              className="w-full"
              disabled={!newTodoTitle.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มงาน
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Todos List by Date */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">งานที่มีกำหนด</h3>
        
        {todosWithDueDate.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">ยังไม่มีงานที่กำหนดวัน</p>
            <p className="text-sm text-muted-foreground mt-2">คลิกที่วันในปฏิทินเพื่อเพิ่มงานใหม่</p>
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
