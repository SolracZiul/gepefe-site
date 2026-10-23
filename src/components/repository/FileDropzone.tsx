import { useRef, useState, type ReactNode } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  id: string;
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  onFiles: (files: FileList) => void;
  children?: ReactNode;
}

/** Shared dashed drag & drop area used by every admin upload (PDFs and images). */
export function FileDropzone({ id, accept, multiple, label, hint, onFiles, children }: FileDropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files); }}
        className={cn('flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-primary/60 hover:bg-muted/50', dragging && 'border-primary bg-primary/5')}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
        <input ref={input} id={id} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={e => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ''; }} />
      </label>
      {children}
    </div>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <header className="mb-5 border-b border-border pb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function FormPageHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return null as unknown as ReactNode extends never ? never : JSX.Element ?? (onBack && title && subtitle);
}
