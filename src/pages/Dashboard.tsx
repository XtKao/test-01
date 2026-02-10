import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { format, subDays, startOfDay, isAfter, isBefore, addDays } from 'date-fns';
import { th } from 'date-fns/locale';

const CHART_COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(160, 84%, 39%)',
  'hsl(35, 100%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(0, 84%, 60%)',
  'hsl(190, 80%, 50%)',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { allTodos, categories } = useTodos();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  // Bar chart: tasks completed per day (last 7 days)
  const barData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const nextDay = addDays(day, 1);
      const completed = allTodos.filter(t => {
        if (!t.completed) return false;
        // Use createdAt as proxy since we don't have completedAt
        const created = t.createdAt;
        return isAfter(created, day) && isBefore(created, nextDay);
      }).length;
      const created = allTodos.filter(t => {
        const c = t.createdAt;
        return isAfter(c, day) && isBefore(c, nextDay);
      }).length;
      days.push({
        name: format(day, 'EEE', { locale: th }),
        เสร็จ: completed,
        สร้าง: created,
      });
    }
    return days;
  }, [allTodos]);

  // Pie chart: by category
  const pieData = useMemo(() => {
    const catMap = new Map<string, number>();
    let uncategorized = 0;
    allTodos.forEach(t => {
      if (t.categoryId) {
        catMap.set(t.categoryId, (catMap.get(t.categoryId) || 0) + 1);
      } else {
        uncategorized++;
      }
    });
    const result = categories
      .filter(c => catMap.has(c.id))
      .map(c => ({ name: c.name, value: catMap.get(c.id) || 0, color: c.color }));
    if (uncategorized > 0) {
      result.push({ name: 'ไม่มีหมวด', value: uncategorized, color: 'hsl(220, 10%, 60%)' });
    }
    return result;
  }, [allTodos, categories]);

  // Line chart: productivity trend (last 7 days)
  const lineData = useMemo(() => {
    const days = [];
    let cumulativeCompleted = 0;
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const nextDay = addDays(day, 1);
      const completedToday = allTodos.filter(t => {
        if (!t.completed) return false;
        return isAfter(t.createdAt, day) && isBefore(t.createdAt, nextDay);
      }).length;
      cumulativeCompleted += completedToday;
      days.push({
        name: format(day, 'd MMM', { locale: th }),
        productivity: cumulativeCompleted,
      });
    }
    return days;
  }, [allTodos]);

  // Stats
  const stats = useMemo(() => {
    const total = allTodos.length;
    const completed = allTodos.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Streak: consecutive days with at least 1 completed task
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = startOfDay(subDays(new Date(), i));
      const nextDay = addDays(day, 1);
      const hasCompleted = allTodos.some(t => {
        if (!t.completed) return false;
        return isAfter(t.createdAt, day) && isBefore(t.createdAt, nextDay);
      });
      if (hasCompleted) streak++;
      else if (i > 0) break;
    }

    const todayCompleted = allTodos.filter(t => {
      if (!t.completed) return false;
      return isAfter(t.createdAt, startOfDay(new Date()));
    }).length;

    return { total, completed, completionRate, streak, todayCompleted };
  }, [allTodos]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <KeyboardShortcutsHelp />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">สรุปผลงานรายสัปดาห์</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">อัตราทำเสร็จ</p>
          </div>

          <div className="glass rounded-2xl p-5 text-center animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <Flame className="h-6 w-6 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground mt-1">วันติดต่อกัน</p>
          </div>

          <div className="glass rounded-2xl p-5 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.todayCompleted}</p>
            <p className="text-xs text-muted-foreground mt-1">เสร็จวันนี้</p>
          </div>

          <div className="glass rounded-2xl p-5 text-center animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.completed}/{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">งานทั้งหมด</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="glass rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">งานต่อวัน (7 วัน)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="สร้าง" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="เสร็จ" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="glass rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">สัดส่วนตามหมวดหมู่</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                ยังไม่มีข้อมูล
              </div>
            )}
          </div>

          {/* Line Chart */}
          <div className="glass rounded-2xl p-5 md:col-span-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">แนวโน้ม Productivity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  name="ผลงานสะสม"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
