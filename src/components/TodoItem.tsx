import { useState } from 'react';
import { Check, Trash2, Calendar, Clock, Flag, Edit3, X, GripVertical } from 'lucide-react';
import { Todo, Priority, Category } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  categories: Category[];
  isDragging?: boolean;
}

const priorityConfig = {
  high: { 
    label: 'สูง', 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    dot: 'bg-destructive'
  },
  medium: { 
    label: 'กลาง', 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    dot: 'bg-warning'
  },
  low: { 
    label: 'ต่ำ', 
    color: 'text-success', 
    bg: 'bg-success/10',
    border: 'border-success/30',
    dot: 'bg-success'
  },
};

export function TodoItem({ todo, onToggle, onDelete, onUpdate, categories, isDragging }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'วันนี้';
    if (isTomorrow(date)) return 'พรุ่งนี้';
    return format(date, 'd MMM', { locale: th });
  };

  const isOverdue = todo.dueDate && isPast(todo.dueDate) && !todo.completed;
  const category = categories.find(c => c.id === todo.categoryId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'task-card group',
        todo.completed && 'opacity-60',
        isOverdue && 'border-destructive/50',
        isDragging && 'opacity-50 shadow-xl scale-105'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 -ml-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-0.5',
            todo.completed
              ? 'bg-primary border-primary'
              : `border-muted-foreground/30 hover:border-primary/50 ${priorityConfig[todo.priority].border}`
          )}
        >
          {todo.completed && (
            <Check className="h-3.5 w-3.5 text-primary-foreground animate-check" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="h-8 bg-secondary/50"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <p
                className={cn(
                  'text-base font-medium transition-all',
                  todo.completed && 'line-through text-muted-foreground'
                )}
              >
                {todo.title}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Category Badge */}
                {category && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </span>
                )}

                {/* Priority Badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    priorityConfig[todo.priority].bg,
                    priorityConfig[todo.priority].color
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', priorityConfig[todo.priority].dot)} />
                  {priorityConfig[todo.priority].label}
                </span>

                {/* Due Date */}
                {todo.dueDate && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDueDate(todo.dueDate)}
                  </span>
                )}

                {/* Reminder Time */}
                {todo.reminderTime && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {format(todo.reminderTime, 'HH:mm')}
                    {todo.notified && <span className="text-success">(แจ้งแล้ว)</span>}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(todo.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
