import { useRef } from 'react';
import { Paperclip, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Attachment } from '@/hooks/useAttachments';
import { cn } from '@/lib/utils';

interface AttachmentListProps {
  attachments: Attachment[];
  onUpload: (file: File) => void;
  onDelete: (attachmentId: string) => void;
  compact?: boolean;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return File;
}

export function AttachmentList({ attachments, onUpload, onDelete, compact }: AttachmentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return;
      }
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Paperclip className="h-3.5 w-3.5" />
        แนบไฟล์
      </button>

      {attachments.length > 0 && (
        <div className={cn('flex flex-wrap gap-2', compact && 'gap-1')}>
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.fileType);
            const isImage = attachment.fileType.startsWith('image/');

            return (
              <div
                key={attachment.id}
                className="group relative flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50 text-xs hover:bg-secondary transition-colors"
              >
                {isImage ? (
                  <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <img src={attachment.fileUrl} alt={attachment.fileName} className="h-6 w-6 rounded object-cover" />
                    <span className="max-w-[100px] truncate">{attachment.fileName}</span>
                  </a>
                ) : (
                  <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="max-w-[100px] truncate">{attachment.fileName}</span>
                  </a>
                )}
                <span className="text-muted-foreground">{formatFileSize(attachment.fileSize)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(attachment.id)}
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
