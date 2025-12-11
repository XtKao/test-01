import { useState } from 'react';
import { Category } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, color: string, icon: string) => void;
  onUpdateCategory: (id: string, name: string, color: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(160, 84%, 39%)',
  'hsl(280, 70%, 55%)',
  'hsl(35, 100%, 55%)',
  'hsl(0, 84%, 60%)',
  'hsl(200, 90%, 50%)',
  'hsl(320, 70%, 55%)',
  'hsl(80, 70%, 45%)',
];

const PRESET_ICONS = ['📌', '💼', '🏠', '👤', '🛒', '❤️', '📚', '🎯', '🎨', '🔧', '📧', '🎮'];

export function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);

  const resetForm = () => {
    setName('');
    setColor(PRESET_COLORS[0]);
    setIcon(PRESET_ICONS[0]);
    setEditingCategory(null);
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    onAddCategory(name.trim(), color, icon);
    toast.success('เพิ่มหมวดหมู่สำเร็จ');
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingCategory || !name.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    onUpdateCategory(editingCategory.id, name.trim(), color, icon);
    toast.success('แก้ไขหมวดหมู่สำเร็จ');
    resetForm();
  };

  const handleDelete = (category: Category) => {
    onDeleteCategory(category.id);
    toast.success('ลบหมวดหมู่สำเร็จ');
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setIcon(category.icon);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>จัดการหมวดหมู่</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Form */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
            <h4 className="font-medium text-sm">
              {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </h4>

            <div className="space-y-2">
              <Label>ชื่อหมวดหมู่</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น งานเร่งด่วน"
              />
            </div>

            <div className="space-y-2">
              <Label>เลือกสี</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color === c && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>เลือกไอคอน</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                      'bg-secondary hover:bg-secondary/80',
                      icon === i && 'ring-2 ring-primary'
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {editingCategory ? (
                <>
                  <Button onClick={handleUpdate} className="flex-1">
                    <Edit2 className="h-4 w-4 mr-2" />
                    บันทึกการแก้ไข
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button onClick={handleAdd} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มหมวดหมู่
                </Button>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              หมวดหมู่ทั้งหมด ({categories.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
