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

// Generate a signed URL from a storage path
async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('todo-attachments')
    .createSignedUrl(storagePath, 3600); // 1 hour expiry
  if (error || !data?.signedUrl) {
    console.error('Error creating signed URL:', error);
    return '';
  }
  return data.signedUrl;
}

// Extract the storage path from a stored file_url value.
// It could be a full public URL or already a relative path.
function extractStoragePath(fileUrl: string): string {
  try {
    const url = new URL(fileUrl);
    const marker = '/storage/v1/object/public/todo-attachments/';
    const idx = url.pathname.indexOf(marker);
    if (idx !== -1) {
      return decodeURIComponent(url.pathname.substring(idx + marker.length));
    }
    // Also handle signed URL paths
    const signedMarker = '/storage/v1/object/sign/todo-attachments/';
    const sIdx = url.pathname.indexOf(signedMarker);
    if (sIdx !== -1) {
      return decodeURIComponent(url.pathname.substring(sIdx + signedMarker.length));
    }
  } catch {
    // Not a URL – treat as a relative path already
  }
  return fileUrl;
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
      // Generate signed URLs for all attachments
      const mapped = await Promise.all(
        (data || []).map(async (a) => {
          const storagePath = extractStoragePath(a.file_url);
          const signedUrl = await getSignedUrl(storagePath);
          return {
            id: a.id,
            todoId: a.todo_id,
            fileName: a.file_name,
            fileUrl: signedUrl || a.file_url,
            fileType: a.file_type,
            fileSize: a.file_size,
            createdAt: new Date(a.created_at),
          };
        })
      );
      setAttachments(prev => ({
        ...prev,
        [todoId]: mapped,
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

    // Store the storage path in the database (not a public URL)
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        todo_id: todoId,
        user_id: user.id,
        file_name: file.name,
        file_url: filePath, // Store path, not URL
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving attachment:', error);
      toast.error('บันทึกไฟล์ไม่สำเร็จ');
    } else if (data) {
      const signedUrl = await getSignedUrl(filePath);
      const newAttachment: Attachment = {
        id: data.id,
        todoId: data.todo_id,
        fileName: data.file_name,
        fileUrl: signedUrl || filePath,
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

    // Look up the original storage path from the DB
    const { data: dbAttachment } = await supabase
      .from('attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();

    if (dbAttachment) {
      const storagePath = extractStoragePath(dbAttachment.file_url);
      await supabase.storage.from('todo-attachments').remove([storagePath]);
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
