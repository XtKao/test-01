
-- Add recurring task columns to todos table
ALTER TABLE public.todos
ADD COLUMN recurrence_type text NOT NULL DEFAULT 'none',
ADD COLUMN recurrence_interval integer NOT NULL DEFAULT 1,
ADD COLUMN recurrence_days text[] DEFAULT NULL,
ADD COLUMN recurrence_end_date timestamp with time zone DEFAULT NULL;
