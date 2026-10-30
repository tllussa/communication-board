import { useRef, useState, type FormEvent } from 'react';
import { ARASAAC_LANGUAGES, arasaacThumbUrl, DEFAULT_LANGUAGE, isArasaacLanguage, searchArasaac, type ArasaacResult } from '../arasaac';
import { addArasaacImage } from '../library';
import type { LibraryImage } from '../types';

const MAX_RESULTS = 60;
const LANG_STORAGE_KEY = 'arasaacSearchLanguage';

function storedLanguage() {
  const lang = localStorage.getItem(LANG_STORAGE_KEY);
  return isArasaacLanguage(lang) ? lang : DEFAULT_LANGUAGE;
}

export function ArasaacSearch({ onAdded, defaultLang }: { onAdded: (image: LibraryImage) => void; defaultLang?: string }) {
  const [term, setTerm] = useState('');
  const [lang, setLang] = useState(() => defaultLang ?? storedLanguage());
  const [results, setResults] = useState<ArasaacResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      setResults((await searchArasaac(q, lang, controller.signal)).slice(0, MAX_RESULTS));
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Error de búsqueda');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const add = async (result: ArasaacResult) => {
    setBusyId(result.id);
    try {
      onAdded(await addArasaacImage(result));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo añadir el pictograma');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="arasaac-search">
      <form className="toolbar" onSubmit={(e) => void search(e)}>
        <input type="search" placeholder="Buscar pictogramas ARASAAC (p. ej. comer, casa…)" value={term} onChange={(e) => setTerm(e.target.value)} />
        <select
          value={lang}
          aria-label="Idioma de búsqueda"
          onChange={(e) => {
            setLang(e.target.value);
            localStorage.setItem(LANG_STORAGE_KEY, e.target.value);
          }}
        >
          {Object.entries(ARASAAC_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {results && results.length === 0 && <p className="empty">Sin resultados.</p>}
      {results && results.length > 0 && (
        <>
          <p className="hint">Pulsa un pictograma para añadirlo a tu biblioteca.</p>
          <div className="image-grid">
            {results.map((r) => (
              <div className="thumb" key={r.id}>
                <button type="button" className="thumb-body" onClick={() => void add(r)} disabled={busyId !== null} title={r.keywords.join(', ')}>
                  <div className="thumb-image">
                    <img src={arasaacThumbUrl(r.id)} alt="" loading="lazy" />
                  </div>
                  <span className="thumb-name">{busyId === r.id ? 'Añadiendo…' : r.keywords[0] ?? r.id}</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
