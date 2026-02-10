import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Attachment {
  id: string;
  todoId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export function useAttachments() {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});

  const fetchAttachments = useCallback(async (todoId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error);
    } else {
      setAttachments(prev => ({
        ...prev,
        [todoId]: (data || []).map(a => ({
          id: a.id,
          todoId: a.todo_id,
          fileName: a.file_name,
          fileUrl: a.file_url,
          fileType: a.file_type,
          fileSize: a.file_size,
          createdAt: new Date(a.created_at),
        })),
      }));
    }
  }, [user]);

  const uploadAttachment = useCallback(async (todoId: string, file: File) => {
    if (!user) return;

    const filePath = `${user.id}/${todoId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('todo-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('อัปโหลดไฟล์ไม่สำเร็จ');
      return;
    }

    const { data: urlData } = supabase.storage
      .from('todo-attachments')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('attachments')
      .insert({
        todo_id: todoId,
        user_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving attachment:', error);
      toast.error('บันทึกไฟล์ไม่สำเร็จ');
    } else if (data) {
      const newAttachment: Attachment = {
        id: data.id,
        todoId: data.todo_id,
        fileName: data.file_name,
        fileUrl: data.file_url,
        fileType: data.file_type,
        fileSize: data.file_size,
        createdAt: new Date(data.created_at),
      };
      setAttachments(prev => ({
        ...prev,
        [todoId]: [newAttachment, ...(prev[todoId] || [])],
      }));
      toast.success('อัปโหลดไฟล์สำเร็จ');
    }
  }, [user]);

  const deleteAttachment = useCallback(async (todoId: string, attachmentId: string) => {
    const attachment = attachments[todoId]?.find(a => a.id === attachmentId);
    if (!attachment) return;

    // Extract path from URL
    const url = new URL(attachment.fileUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/todo-attachments/');
    if (pathParts[1]) {
      await supabase.storage.from('todo-attachments').remove([decodeURIComponent(pathParts[1])]);
    }

    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      console.error('Error deleting attachment:', error);
      toast.error('ลบไฟล์ไม่สำเร็จ');
    } else {
      setAttachments(prev => ({
        ...prev,
        [todoId]: (prev[todoId] || []).filter(a => a.id !== attachmentId),
      }));
      toast.success('ลบไฟล์สำเร็จ');
    }
  }, [attachments]);

  return {
    attachments,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
  };
}
