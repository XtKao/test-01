import { useState, RefObject } from 'react';
import { Plus, Calendar, Clock, Flag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Priority, Category, RecurrenceType } from '@/types/todo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { RecurrenceSelector } from './RecurrenceSelector';

interface TodoInputProps {
  onAdd: (
    title: string,
    priority: Priority,
    description?: string,
    dueDate?: Date,
    reminderTime?: Date,
    categoryId?: string,
    recurrenceType?: RecurrenceType,
    recurrenceInterval?: number,
    recurrenceDays?: string[],
  ) => void;
  categories: Category[];
}

const priorityConfig = {
  high: { label: 'สูง', color: 'text-destructive', bg: 'bg-destructive/10' },
  medium: { label: 'กลาง', color: 'text-warning', bg: 'bg-warning/10' },
  low: { label: 'ต่ำ', color: 'text-success', bg: 'bg-success/10' },
};

export function TodoInput({ onAdd, categories }: TodoInputProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [reminderTime, setReminderTime] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let reminder: Date | undefined;
    if (dueDate && reminderTime) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      reminder = new Date(dueDate);
      reminder.setHours(hours, minutes, 0, 0);
    }

    onAdd(
      title.trim(), priority, undefined, dueDate, reminder, selectedCategory,
      recurrenceType, recurrenceInterval, recurrenceDays.length > 0 ? recurrenceDays : undefined,
    );
    setTitle('');
    setPriority('medium');
    setDueDate(undefined);
    setReminderTime('');
    setSelectedCategory(undefined);
    setIsExpanded(false);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceDays([]);
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="glass rounded-2xl p-4 shadow-card animate-fade-in">
        <div className="flex gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="เพิ่มงานใหม่..."
            className="flex-1 bg-secondary/50 border-0 h-12 text-base placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 flex flex-wrap gap-3 animate-fade-in">
            {/* Priority Selection */}
            <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
              {(Object.keys(priorityConfig) as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                    priority === p
                      ? `${priorityConfig[p].bg} ${priorityConfig[p].color}`
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Flag className="h-3.5 w-3.5" />
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>

            {/* Category Selection */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    'h-9 px-3 bg-secondary/50 hover:bg-secondary gap-2',
                    selectedCategory && 'text-foreground'
                  )}
                  style={{
                    backgroundColor: selectedCategoryData?.color ? `${selectedCategoryData.color}20` : undefined,
                  }}
                >
                  {selectedCategoryData ? (
                    <>
                      <span>{selectedCategoryData.icon}</span>
                      {selectedCategoryData.name}
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4" />
                      หมวดหมู่
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                        selectedCategory === category.id
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-secondary'
                      )}
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Due Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    'h-9 px-3 bg-secondary/50 hover:bg-secondary',
                    dueDate && 'text-primary'
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {dueDate ? format(dueDate, 'd MMM', { locale: th }) : 'กำหนดวัน'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Reminder Time */}
            {dueDate && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="flex items-center h-9 px-3 bg-secondary/50 rounded-md">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none"
                    placeholder="เวลาแจ้งเตือน"
                  />
                </div>
              </div>
            )}

            {/* Recurrence */}
            <RecurrenceSelector
              recurrenceType={recurrenceType}
              recurrenceInterval={recurrenceInterval}
              recurrenceDays={recurrenceDays}
              onChange={(type, interval, days) => {
                setRecurrenceType(type);
                setRecurrenceInterval(interval);
                setRecurrenceDays(days || []);
              }}
            />
          </div>
        )}
      </div>
    </form>
  );
}
