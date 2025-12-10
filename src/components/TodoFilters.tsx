import { FilterType, SortType } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TodoFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
  stats: {
    total: number;
    active: number;
    completed: number;
  };
}

const filterOptions: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'ทั้งหมด', icon: <ListTodo className="h-4 w-4" /> },
  { value: 'active', label: 'กำลังทำ', icon: <Circle className="h-4 w-4" /> },
  { value: 'completed', label: 'เสร็จแล้ว', icon: <CheckCircle2 className="h-4 w-4" /> },
];

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'priority', label: 'ความสำคัญ' },
  { value: 'dueDate', label: 'กำหนดส่ง' },
  { value: 'createdAt', label: 'วันที่สร้าง' },
];

export function TodoFilters({ filter, setFilter, sortBy, setSortBy, stats }: TodoFiltersProps) {
  const getCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'all': return stats.total;
      case 'active': return stats.active;
      case 'completed': return stats.completed;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === option.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.icon}
            {option.label}
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-md text-xs',
                filter === option.value
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {getCount(option.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 bg-secondary/50 hover:bg-secondary">
            <ArrowUpDown className="h-4 w-4" />
            จัดเรียงตาม: {sortOptions.find(s => s.value === sortBy)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={cn(sortBy === option.value && 'bg-accent')}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
