import { Category, DEFAULT_CATEGORIES } from '@/types/todo';
import { cn } from '@/lib/utils';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
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
        </button>
      ))}
    </div>
  );
}
