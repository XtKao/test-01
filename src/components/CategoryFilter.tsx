import { Category } from '@/types/todo';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryStats?: Record<string, { total: number; completed: number; percentage: number }>;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  categoryStats,
}: CategoryFilterProps) {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            selectedCategory === null
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <Tag className="h-3.5 w-3.5" />
          ทั้งหมด
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              selectedCategory === category.id
                ? 'shadow-md'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : undefined,
              color: selectedCategory === category.id ? 'white' : undefined,
            }}
          >
            <span>{category.icon}</span>
            {category.name}
            {categoryStats?.[category.id] && categoryStats[category.id].total > 0 && (
              <span className="ml-1 text-xs opacity-75">
                ({categoryStats[category.id].completed}/{categoryStats[category.id].total})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Progress bars for each category */}
      {categoryStats && categories.length > 0 && (
        <div className="glass rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">ความคืบหน้าแต่ละหมวดหมู่</p>
          {categories.map((category) => {
            const stat = categoryStats[category.id];
            if (!stat || stat.total === 0) return null;
            
            return (
              <div key={category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {stat.completed}/{stat.total} ({stat.percentage}%)
                  </span>
                </div>
                <Progress 
                  value={stat.percentage} 
                  className="h-2"
                  style={{
                    ['--progress-color' as string]: category.color,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
