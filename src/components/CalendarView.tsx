import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { DayPicker, DayProps } from 'react-day-picker';
import { Todo, Category, Priority } from '@/types/todo';
import { format, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Flag, CheckCircle2, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
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

const LONG_PRESS_DURATION = 500; // ms

export function CalendarView({ todos, categories, onAddTodo }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState<string>('');
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const pressedDate = useRef<Date | null>(null);

  const todosWithDueDate = useMemo(() => {
    return todos.filter(todo => todo.dueDate);
  }, [todos]);

  const selectedDates = useMemo(() => {
    return todosWithDueDate.map(todo => todo.dueDate!);
  }, [todosWithDueDate]);

  const getTodosForDate = useCallback((date: Date) => {
    return todosWithDueDate.filter(todo => 
      todo.dueDate && isSameDay(todo.dueDate, date)
    );
  }, [todosWithDueDate]);

  const getTodoCountForDate = useCallback((date: Date) => {
    return getTodosForDate(date).length;
  }, [getTodosForDate]);

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const handleDayClick = useCallback((date: Date) => {
    // If it was a long press, don't trigger click action
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    
    setSelectedDate(date);
    setIsViewDialogOpen(true);
  }, []);

  const handlePointerDown = useCallback((date: Date) => {
    isLongPress.current = false;
    pressedDate.current = date;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setSelectedDate(date);
      setIsAddDialogOpen(true);
      setNewTodoTitle('');
      setNewTodoPriority('medium');
      setNewTodoCategory('');
    }, LONG_PRESS_DURATION);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleAddTodo = () => {
    if (!newTodoTitle.trim() || !selectedDate || !onAddTodo) return;
    
    onAddTodo(
      newTodoTitle.trim(),
      newTodoPriority,
      newTodoCategory || undefined,
      selectedDate,
      undefined
    );
    
    setIsAddDialogOpen(false);
    setNewTodoTitle('');
    setNewTodoPriority('medium');
    setNewTodoCategory('');
  };

  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate) : [];

  // Custom Day component
  const CustomDay = useCallback(({ date, displayMonth, ...props }: DayProps) => {
    const todoCount = getTodoCountForDate(date);
    const isOutside = date.getMonth() !== displayMonth.getMonth();
    const isToday = isSameDay(date, new Date());
    const hasTodos = todoCount > 0;
    
    return (
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal relative",
          isToday && "bg-accent text-accent-foreground",
          isOutside && "text-muted-foreground opacity-50",
          hasTodos && "ring-2 ring-primary ring-offset-1"
        )}
        onClick={() => handleDayClick(date)}
        onPointerDown={() => handlePointerDown(date)}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
      >
        {date.getDate()}
        {hasTodos && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {todoCount}
          </span>
        )}
      </button>
    );
  }, [getTodoCountForDate, handleDayClick, handlePointerDown, handlePointerUp, handlePointerLeave]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-4 shadow-card">
        <p className="text-xs text-muted-foreground text-center mb-2">
          คลิกดูงาน • กดค้างเพิ่มงาน
        </p>
        <DayPicker
          mode="multiple"
          selected={selectedDates}
          className="mx-auto pointer-events-auto p-3"
          locale={th}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal"),
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
            Day: CustomDay,
          }}
        />
      </div>

      {/* View Todos Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              งานวันที่ {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: th })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 pt-4">
            {selectedDateTodos.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">ไม่มีงานในวันนี้</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsAddDialogOpen(true);
                    setNewTodoTitle('');
                    setNewTodoPriority('medium');
                    setNewTodoCategory('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มงานใหม่
                </Button>
              </div>
            ) : (
              <>
                {selectedDateTodos.map(todo => {
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
                              'font-medium text-foreground',
                              todo.completed && 'line-through text-muted-foreground'
                            )}>
                              {todo.title}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm">
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
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsAddDialogOpen(true);
                    setNewTodoTitle('');
                    setNewTodoPriority('medium');
                    setNewTodoCategory('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มงานใหม่
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Todo Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <p className="text-sm text-muted-foreground mt-2">กดค้างที่วันในปฏิทินเพื่อเพิ่มงานใหม่</p>
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
