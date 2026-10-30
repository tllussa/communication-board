import { useEffect, useState } from 'react';
import type { LibraryImage } from '../types';
import { ArasaacSearch } from './ArasaacSearch';
import { LibraryBrowser } from './LibraryBrowser';

export function ImagePicker({
  onSelect,
  onClose,
  lang,
}: {
  onSelect: (image: LibraryImage) => void;
  onClose: () => void;
  lang: string;
}) {
  const [tab, setTab] = useState<'library' | 'arasaac'>('library');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Elegir imagen" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="tabs">
            <button type="button" className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>
              Mi biblioteca
            </button>
            <button type="button" className={tab === 'arasaac' ? 'active' : ''} onClick={() => setTab('arasaac')}>
              Buscar en ARASAAC
            </button>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {tab === 'library' ? <LibraryBrowser mode="select" onSelect={onSelect} /> : <ArasaacSearch onAdded={onSelect} defaultLang={lang} />}
        </div>
      </div>
    </div>
  );
}
