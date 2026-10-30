import { useEffect, useMemo, useState } from 'react';
import { deleteImage, listImages, saveImage } from '../db';
import { forgetImageUrl, useImageUrl } from '../hooks/useImageUrl';
import type { LibraryImage } from '../types';
import { UploadButton } from './UploadButton';

interface Props {
  mode: 'select' | 'manage';
  onSelect?: (image: LibraryImage) => void;
  refreshKey?: number;
}

export function LibraryBrowser({ mode, onSelect, refreshKey }: Props) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [filter, setFilter] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    void listImages().then(setImages);
  }, [refreshKey, reload]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return images;
    return images.filter((img) => img.name.toLowerCase().includes(q) || img.keywords.some((k) => k.includes(q)));
  }, [images, filter]);

  const rename = async (img: LibraryImage) => {
    const name = prompt('Nuevo nombre', img.name)?.trim();
    if (!name) return;
    await saveImage({ ...img, name, keywords: Array.from(new Set([...img.keywords, name.toLowerCase()])) });
    setReload((r) => r + 1);
  };

  const remove = async (img: LibraryImage) => {
    if (!confirm(`¿Eliminar "${img.name}" de la biblioteca? Las celdas que la usen quedarán sin imagen.`)) return;
    await deleteImage(img.id);
    forgetImageUrl(img.id);
    setReload((r) => r + 1);
  };

  return (
    <div className="library-browser">
      <div className="toolbar">
        <input type="search" placeholder="Buscar en mi biblioteca…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <UploadButton
          onUploaded={(added) => {
            setReload((r) => r + 1);
            if (mode === 'select' && added.length === 1) onSelect?.(added[0]);
          }}
        />
      </div>
      {visible.length === 0 ? (
        <p className="empty">
          {images.length === 0 ? 'La biblioteca está vacía. Busca pictogramas en ARASAAC o sube tus imágenes.' : 'Sin resultados.'}
        </p>
      ) : (
        <div className="image-grid">
          {visible.map((img) => (
            <LibraryThumb
              key={img.id}
              image={img}
              onClick={mode === 'select' ? () => onSelect?.(img) : undefined}
              onRename={mode === 'manage' ? () => void rename(img) : undefined}
              onDelete={mode === 'manage' ? () => void remove(img) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryThumb({
  image,
  onClick,
  onRename,
  onDelete,
}: {
  image: LibraryImage;
  onClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  const url = useImageUrl(image.id);
  const body = (
    <>
      <div className="thumb-image">{url && <img src={url} alt="" />}</div>
      <span className="thumb-name">{image.name}</span>
      {image.source === 'arasaac' && <span className="badge">ARASAAC</span>}
    </>
  );
  return (
    <div className="thumb">
      {onClick ? (
        <button type="button" className="thumb-body" onClick={onClick} title={image.name}>
          {body}
        </button>
      ) : (
        <div className="thumb-body">{body}</div>
      )}
      {(onRename || onDelete) && (
        <div className="thumb-actions">
          {onRename && <button type="button" onClick={onRename}>Renombrar</button>}
          {onDelete && <button type="button" className="danger" onClick={onDelete}>Eliminar</button>}
        </div>
      )}
    </div>
  );
}
