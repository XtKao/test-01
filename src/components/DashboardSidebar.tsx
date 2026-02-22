import { useMemo } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { Flame, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { format, subDays, startOfDay, isAfter, isBefore, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

const CHART_COLORS = [
  'hsl(220, 90%, 56%)',
  'hsl(160, 84%, 39%)',
  'hsl(35, 100%, 55%)',
  'hsl(280, 70%, 55%)',
  'hsl(0, 84%, 60%)',
  'hsl(190, 80%, 50%)',
];

export function DashboardSidebar() {
  const { allTodos, categories } = useTodos();

  const barData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const nextDay = addDays(day, 1);
      const completed = allTodos.filter(t => {
        if (!t.completed) return false;
        return isAfter(t.createdAt, day) && isBefore(t.createdAt, nextDay);
      }).length;
      const created = allTodos.filter(t => {
        return isAfter(t.createdAt, day) && isBefore(t.createdAt, nextDay);
      }).length;
      days.push({
        name: format(day, 'EEE', { locale: th }),
        เสร็จ: completed,
        สร้าง: created,
      });
    }
    return days;
  }, [allTodos]);

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

  const stats = useMemo(() => {
    const total = allTodos.length;
    const completed = allTodos.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
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

  return (
    <>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Dashboard</h2>
        <p className="text-xs text-muted-foreground">สรุปผลงานรายสัปดาห์</p>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {/* Stats Cards */}
          <SidebarGroup>
            <SidebarGroupLabel>สถิติ</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="grid grid-cols-2 gap-2 px-1">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <Target className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{stats.completionRate}%</p>
                  <p className="text-[10px] text-muted-foreground">อัตราทำเสร็จ</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <Flame className="h-4 w-4 text-destructive mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{stats.streak}</p>
                  <p className="text-[10px] text-muted-foreground">วันติดต่อกัน</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <CheckCircle2 className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{stats.todayCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">เสร็จวันนี้</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <TrendingUp className="h-4 w-4 text-accent-foreground mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{stats.completed}/{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">งานทั้งหมด</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bar Chart */}
          <SidebarGroup>
            <SidebarGroupLabel>งานต่อวัน (7 วัน)</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-1">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} width={24} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="สร้าง" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="เสร็จ" fill="hsl(160, 84%, 39%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Pie Chart */}
          <SidebarGroup>
            <SidebarGroupLabel>สัดส่วนตามหมวดหมู่</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-1">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
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
                  <div className="flex items-center justify-center h-[100px] text-muted-foreground text-xs">
                    ยังไม่มีข้อมูล
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Line Chart */}
          <SidebarGroup>
            <SidebarGroupLabel>แนวโน้ม Productivity</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-1 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} width={24} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontSize: 11,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      name="ผลงานสะสม"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </>
  );
}
