import { RecurrenceType } from '@/types/todo';
import { Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RecurrenceSelectorProps {
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  recurrenceDays?: string[];
  onChange: (type: RecurrenceType, interval: number, days?: string[]) => void;
}

const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'ไม่ทำซ้ำ' },
  { value: 'daily', label: 'ทุกวัน' },
  { value: 'weekly', label: 'ทุกสัปดาห์' },
  { value: 'monthly', label: 'ทุกเดือน' },
  { value: 'custom', label: 'กำหนดเอง' },
];

const dayOptions = [
  { value: 'mon', label: 'จ' },
  { value: 'tue', label: 'อ' },
  { value: 'wed', label: 'พ' },
  { value: 'thu', label: 'พฤ' },
  { value: 'fri', label: 'ศ' },
  { value: 'sat', label: 'ส' },
  { value: 'sun', label: 'อา' },
];

export function RecurrenceSelector({
  recurrenceType,
  recurrenceInterval,
  recurrenceDays,
  onChange,
}: RecurrenceSelectorProps) {
  const isActive = recurrenceType !== 'none';

  const toggleDay = (day: string) => {
    const current = recurrenceDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    onChange(recurrenceType, recurrenceInterval, updated);
  };

  const getLabel = () => {
    if (!isActive) return 'ทำซ้ำ';
    const opt = recurrenceOptions.find(o => o.value === recurrenceType);
    if (recurrenceInterval > 1) {
      return `ทุก ${recurrenceInterval} ${recurrenceType === 'daily' ? 'วัน' : recurrenceType === 'weekly' ? 'สัปดาห์' : 'เดือน'}`;
    }
    return opt?.label || 'ทำซ้ำ';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-9 px-3 bg-secondary/50 hover:bg-secondary gap-2',
            isActive && 'text-primary'
          )}
        >
          <Repeat className="h-4 w-4" />
          {getLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <Label className="text-sm font-medium">รูปแบบการทำซ้ำ</Label>
          <div className="grid grid-cols-1 gap-1">
            {recurrenceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value, recurrenceInterval, recurrenceDays)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm text-left transition-all',
                  recurrenceType === opt.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-secondary text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {isActive && recurrenceType !== 'custom' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">ทุกกี่ครั้ง</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={recurrenceInterval}
                onChange={(e) => onChange(recurrenceType, Math.max(1, parseInt(e.target.value) || 1), recurrenceDays)}
                className="h-8"
              />
            </div>
          )}

          {recurrenceType === 'custom' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">เลือกวัน</Label>
              <div className="flex gap-1 flex-wrap">
                {dayOptions.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'w-9 h-9 rounded-full text-xs font-medium transition-all',
                      recurrenceDays?.includes(day.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2 mt-2">
                <Label className="text-xs text-muted-foreground">ทุกกี่สัปดาห์</Label>
                <Input
                  type="number"
                  min={1}
                  max={52}
                  value={recurrenceInterval}
                  onChange={(e) => onChange(recurrenceType, Math.max(1, parseInt(e.target.value) || 1), recurrenceDays)}
                  className="h-8"
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
