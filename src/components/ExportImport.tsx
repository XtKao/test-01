import { useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Todo, Category, Subtask } from '@/types/todo';
import { toast } from 'sonner';

interface ExportImportProps {
  todos: Todo[];
  categories: Category[];
  subtasks: Record<string, Subtask[]>;
  onImport: (data: { todos: Partial<Todo>[]; categories?: Partial<Category>[] }) => void;
}

export function ExportImport({ todos, categories, subtasks, onImport }: ExportImportProps) {
  const [importing, setImporting] = useState(false);

  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      todos: todos.map(t => ({
        ...t,
        subtasks: subtasks[t.id] || [],
        categoryName: categories.find(c => c.id === t.categoryId)?.name,
      })),
      categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `todos-${formatDate()}.json`);
    toast.success('ส่งออกข้อมูล JSON สำเร็จ');
  };

  const exportCSV = () => {
    const headers = ['ชื่องาน', 'รายละเอียด', 'สถานะ', 'ระดับความสำคัญ', 'หมวดหมู่', 'กำหนดวัน', 'เวลาแจ้งเตือน', 'การทำซ้ำ', 'สร้างเมื่อ'];
    const rows = todos.map(t => [
      escapeCSV(t.title),
      escapeCSV(t.description || ''),
      t.completed ? 'เสร็จแล้ว' : 'กำลังทำ',
      t.priority === 'high' ? 'สูง' : t.priority === 'medium' ? 'กลาง' : 'ต่ำ',
      categories.find(c => c.id === t.categoryId)?.name || '',
      t.dueDate ? t.dueDate.toISOString() : '',
      t.reminderTime ? t.reminderTime.toISOString() : '',
      t.recurrenceType !== 'none' ? `${t.recurrenceType} (ทุก ${t.recurrenceInterval})` : 'ไม่ทำซ้ำ',
      t.createdAt.toISOString(),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `todos-${formatDate()}.csv`);
    toast.success('ส่งออกข้อมูล CSV สำเร็จ');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.todos || !Array.isArray(data.todos)) {
          toast.error('ไฟล์ไม่ถูกต้อง: ไม่พบข้อมูลงาน');
          return;
        }

        onImport({
          todos: data.todos.map((t: Record<string, unknown>) => ({
            title: t.title as string,
            description: t.description as string | undefined,
            priority: (t.priority as string) || 'medium',
            dueDate: t.dueDate ? new Date(t.dueDate as string) : undefined,
            reminderTime: t.reminderTime ? new Date(t.reminderTime as string) : undefined,
            recurrenceType: (t.recurrenceType as string) || 'none',
            recurrenceInterval: (t.recurrenceInterval as number) || 1,
            recurrenceDays: t.recurrenceDays as string[] | undefined,
          })),
          categories: data.categories,
        });

        toast.success(`นำเข้า ${data.todos.length} งานสำเร็จ`);
      } catch {
        toast.error('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบ');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          นำเข้า/ส่งออก
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>ส่งออกข้อมูล</DropdownMenuLabel>
        <DropdownMenuItem onClick={exportJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          ส่งออก JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          ส่งออก CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>นำเข้าข้อมูล</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleImport} disabled={importing} className="gap-2 cursor-pointer">
          <Upload className="h-4 w-4" />
          {importing ? 'กำลังนำเข้า...' : 'นำเข้าจาก JSON'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

function escapeCSV(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
