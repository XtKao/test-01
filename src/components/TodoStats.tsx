import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

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
    <div className="grid grid-cols-4 gap-3">
      <div className="glass rounded-2xl p-4 text-center animate-fade-in group hover:shadow-lg transition-all duration-300" style={{ animationDelay: '50ms' }}>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <ListTodo className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        <p className="text-xs text-muted-foreground">ทั้งหมด</p>
      </div>

      <div className="glass rounded-2xl p-4 text-center animate-fade-in group hover:shadow-lg transition-all duration-300" style={{ animationDelay: '100ms' }}>
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <Clock className="h-5 w-5 text-warning" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.active}</p>
        <p className="text-xs text-muted-foreground">กำลังทำ</p>
      </div>

      <div className="glass rounded-2xl p-4 text-center animate-fade-in group hover:shadow-lg transition-all duration-300" style={{ animationDelay: '150ms' }}>
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <CheckCircle2 className="h-5 w-5 text-success" />
        </div>
        <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
        <p className="text-xs text-muted-foreground">เสร็จแล้ว</p>
      </div>

      <div className="glass rounded-2xl p-4 text-center animate-fade-in group hover:shadow-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
        <p className="text-xs text-muted-foreground">สำเร็จ</p>
      </div>
    </div>
  );
}
