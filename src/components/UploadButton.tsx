import { useRef, useState } from 'react';
import { addUserImages, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../library';
import type { LibraryImage } from '../types';

export function UploadButton({ onUploaded }: { onUploaded: (images: LibraryImage[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const { added, rejected } = await addUserImages(Array.from(files));
      if (rejected.length) {
        alert(
          `No se añadieron (formato no admitido o mayor de ${MAX_IMAGE_BYTES / 1024 / 1024} MB):\n${rejected.join('\n')}`,
        );
      }
      onUploaded(added);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? 'Subiendo…' : 'Subir imágenes…'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </>
  );
}
