import { useState } from 'react';
import { Todo, Category, Subtask } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { ListTodo } from 'lucide-react';
import { Attachment } from '@/hooks/useAttachments';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onReorder: (activeId: string, overId: string) => void;
  categories: Category[];
  subtasks: Record<string, Subtask[]>;
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onDeleteSubtask: (todoId: string, subtaskId: string) => void;
  onFetchSubtasks: (todoId: string) => void;
  attachments?: Record<string, Attachment[]>;
  onUploadAttachment?: (todoId: string, file: File) => void;
  onDeleteAttachment?: (todoId: string, attachmentId: string) => void;
  onFetchAttachments?: (todoId: string) => void;
}

export function TodoList({ 
  todos, onToggle, onDelete, onUpdate, onReorder, categories,
  subtasks, onAddSubtask, onToggleSubtask, onDeleteSubtask, onFetchSubtasks,
  attachments, onUploadAttachment, onDeleteAttachment, onFetchAttachments,
}: TodoListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
    
    setActiveId(null);
  };

  const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <ListTodo className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">ยังไม่มีรายการ</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">เริ่มเพิ่มงานใหม่ได้เลย!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TodoItem
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                categories={categories}
                subtasks={subtasks[todo.id] || []}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onFetchSubtasks={onFetchSubtasks}
                attachments={attachments?.[todo.id] || []}
                onUploadAttachment={onUploadAttachment ? (file) => onUploadAttachment(todo.id, file) : undefined}
                onDeleteAttachment={onDeleteAttachment ? (id) => onDeleteAttachment(todo.id, id) : undefined}
                onFetchAttachments={onFetchAttachments ? () => onFetchAttachments(todo.id) : undefined}
              />
            </div>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeTodo ? (
          <TodoItem
            todo={activeTodo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            categories={categories}
            isDragging
            subtasks={subtasks[activeTodo.id] || []}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onFetchSubtasks={onFetchSubtasks}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
