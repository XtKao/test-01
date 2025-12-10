import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface TodoStatsProps {
  stats: {
    total: number;
    active: number;
    completed: number;
  };
}

export function TodoStats({ stats }: TodoStatsProps) {
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="glass rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <ListTodo className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        <p className="text-xs text-muted-foreground">ทั้งหมด</p>
      </div>

      <div className="glass rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
          <Clock className="h-5 w-5 text-warning" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.active}</p>
        <p className="text-xs text-muted-foreground">กำลังทำ</p>
      </div>

      <div className="glass rounded-xl p-4 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
        <p className="text-xs text-muted-foreground">เสร็จแล้ว</p>
      </div>
    </div>
  );
}
