
# เปลี่ยน Dashboard เป็น Sidebar Layout พร้อม Responsive ทุกอุปกรณ์

## สิ่งที่จะเปลี่ยน

แทนที่ Dashboard จะเป็นหน้าแยกต่างหาก จะรวมเข้ากับหน้าหลักโดยใช้ **Sidebar** อยู่ด้านซ้าย แสดง Stats cards และกราฟต่างๆ ส่วนด้านขวาจะเป็นรายการ Todo เหมือนเดิม

### พฤติกรรมตามอุปกรณ์:
- **PC / Laptop (1024px+)**: Sidebar เปิดค้างด้านซ้าย แสดง Dashboard เต็มรูปแบบ สามารถพับได้
- **Tablet / iPad (768-1023px)**: Sidebar พับเป็นไอคอนแคบ กดเพื่อขยาย
- **Mobile (< 768px)**: Sidebar ซ่อนเป็น Sheet (drawer) เลื่อนเข้ามาจากซ้าย มีปุ่มเปิดที่ header

---

## ขั้นตอนการทำงาน

### 1. สร้าง Component `DashboardSidebar`
- สร้างไฟล์ใหม่ `src/components/DashboardSidebar.tsx`
- ย้าย logic กราฟ/สถิติจาก `Dashboard.tsx` มาใส่ใน Sidebar
- Stats cards แสดงเป็น compact cards ที่ fit กับ sidebar width
- กราฟ 3 ตัว (Bar, Pie, Line) แสดงใน scroll area ภายใน sidebar
- ใช้ `ResponsiveContainer` ของ recharts ให้กราฟปรับขนาดอัตโนมัติ

### 2. สร้าง Layout หลัก `AppLayout`
- สร้างไฟล์ `src/components/AppLayout.tsx`
- ใช้ `SidebarProvider` + `Sidebar` จาก shadcn/ui
- วาง `DashboardSidebar` ด้านซ้าย และ children (เนื้อหา Todo) ด้านขวา
- เพิ่ม `SidebarTrigger` ที่ header bar เพื่อเปิด/ปิด sidebar

### 3. แก้ไข `Index.tsx`
- ลบ Tab "Dashboard" ออกจาก TabsList (เหลือแค่ "รายการ" กับ "ปฏิทิน")
- Wrap เนื้อหาทั้งหมดด้วย `AppLayout`
- ย้าย `SidebarTrigger` ไปอยู่ที่ top bar ร่วมกับ ThemeToggle, UserMenu

### 4. ลบหน้า `/dashboard` แยก
- ลบ route `/dashboard` ออกจาก `App.tsx`
- ลบไฟล์ `src/pages/Dashboard.tsx` (logic ย้ายไป sidebar แล้ว)

### 5. Responsive Design
- **Desktop**: sidebar กว้าง ~280px แสดงกราฟ + stats
- **Tablet**: sidebar พับเหลือ ~48px แสดงไอคอน BarChart3, กดเพื่อขยาย
- **Mobile**: sidebar เป็น Sheet overlay, กดปุ่มที่ header เพื่อเปิด
- กราฟใน sidebar ใช้ height ที่เล็กลง (160-180px) เพื่อให้ดูได้ในพื้นที่แคบ
- Stats cards จัดเป็น grid 2 คอลัมน์ใน sidebar

---

## รายละเอียดทางเทคนิค

### ไฟล์ที่สร้างใหม่:
| ไฟล์ | รายละเอียด |
|------|------------|
| `src/components/DashboardSidebar.tsx` | Sidebar component ที่รวมกราฟ + สถิติ |
| `src/components/AppLayout.tsx` | Layout wrapper ที่ใช้ SidebarProvider |

### ไฟล์ที่แก้ไข:
| ไฟล์ | รายละเอียด |
|------|------------|
| `src/pages/Index.tsx` | ลบ Dashboard tab, wrap ด้วย AppLayout, เพิ่ม SidebarTrigger ที่ top bar |
| `src/App.tsx` | ลบ route `/dashboard` |

### ไฟล์ที่ลบ:
| ไฟล์ | เหตุผล |
|------|--------|
| `src/pages/Dashboard.tsx` | Logic ย้ายไป DashboardSidebar แล้ว |

### Components ที่ใช้:
- `Sidebar`, `SidebarProvider`, `SidebarContent`, `SidebarTrigger` จาก shadcn/ui (มีอยู่แล้ว)
- `ScrollArea` สำหรับ scroll กราฟใน sidebar
- `recharts` components เดิมทั้งหมด (Bar, Pie, Line charts)
- `useIsMobile` hook ที่มีอยู่แล้ว สำหรับ responsive logic
