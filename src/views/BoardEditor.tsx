import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ARASAAC_LANGUAGES, DEFAULT_LANGUAGE } from '../arasaac';
import { ImagePicker } from '../components/ImagePicker';
import { Sheet, SheetViewport } from '../components/Sheet';
import { saveBoard } from '../db';
import { downloadBlob, exportBoard, safeFilename } from '../exportImport';
import { useBoard } from '../hooks/useBoard';
import { useImageUrl } from '../hooks/useImageUrl';
import { imageLabel, translateLabels } from '../library';
import { clamp, createPage, DEFAULT_CELL_BACKGROUND, duplicatePage, LIMITS, resizeGrid } from '../model';
import { PAPER_SIZES } from '../paper';
import type { Board, Cell, Orientation, Page, PaperSize } from '../types';

const AUTOSAVE_MS = 500;

export function BoardEditor() {
  const { boardId } = useParams();
  const { board, loading } = useBoard(boardId);
  if (loading) return <p className="empty">Cargando…</p>;
  if (!board) return <NotFound />;
  return <Editor key={board.id} initial={board} />;
}

export function NotFound() {
  return (
    <p className="empty">
      Panel no encontrado. <Link to="/">Volver a mis paneles</Link>
    </p>
  );
}

function Editor({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [rev, setRev] = useState(0);
  const [savedRev, setSavedRev] = useState(0);
  const [pageId, setPageId] = useState(initial.pages[0].id);
  const [cellId, setCellId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const language = board.language ?? DEFAULT_LANGUAGE;

  useEffect(() => {
    if (rev === savedRev) return;
    const timer = setTimeout(() => void saveBoard(board).then(() => setSavedRev(rev)), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [board, rev, savedRev]);

  // Flush pending changes when leaving the editor before the autosave fires.
  const latest = useRef({ board, dirty: false });
  useEffect(() => {
    latest.current = { board, dirty: rev !== savedRev };
  }, [board, rev, savedRev]);
  useEffect(
    () => () => {
      if (latest.current.dirty) void saveBoard(latest.current.board);
    },
    [],
  );

  const page = board.pages.find((p) => p.id === pageId) ?? board.pages[0];
  const pageIndex = board.pages.indexOf(page);
  const cell = page.cells.find((c) => c.id === cellId) ?? null;

  const update = (fn: (b: Board) => Board) => {
    setBoard(fn);
    setRev((r) => r + 1);
  };
  const updatePage = (fn: (p: Page) => Page) =>
    update((b) => ({ ...b, pages: b.pages.map((p) => (p.id === page.id ? fn(p) : p)) }));
  const updateCell = (patch: Partial<Cell>) => {
    if (cell) patchCell(cell.id, patch);
  };
  // Searches all pages: async callers may finish after the user switched page.
  const patchCell = (id: string, patch: Partial<Cell>) =>
    update((b) => ({
      ...b,
      pages: b.pages.map((p) => ({ ...p, cells: p.cells.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    }));

  const changeLanguage = async (lang: string) => {
    update((b) => ({ ...b, language: lang }));
    const hasImages = board.pages.some((p) => p.cells.some((c) => c.imageId));
    if (!hasImages || !confirm('¿Traducir las descripciones de los pictogramas ARASAAC al nuevo idioma? Se sustituirán los textos actuales de esas celdas.')) return;
    setTranslating(true);
    try {
      const labels = await translateLabels(board, lang);
      update((b) => ({
        ...b,
        pages: b.pages.map((p) => ({ ...p, cells: p.cells.map((c) => (labels.has(c.id) ? { ...c, label: labels.get(c.id)! } : c)) })),
      }));
    } finally {
      setTranslating(false);
    }
  };

  const selectPage = (id: string) => {
    setPageId(id);
    setCellId(null);
  };

  const insertPage = (newPage: Page) => {
    update((b) => {
      const pages = [...b.pages];
      pages.splice(pageIndex + 1, 0, newPage);
      return { ...b, pages };
    });
    selectPage(newPage.id);
  };

  const removePage = () => {
    if (board.pages.length === 1) return;
    if (!confirm(`¿Eliminar la página "${page.name}"?`)) return;
    const neighbour = board.pages[pageIndex + 1] ?? board.pages[pageIndex - 1];
    update((b) => ({
      ...b,
      pages: b.pages
        .filter((p) => p.id !== page.id)
        .map((p) => ({ ...p, cells: p.cells.map((c) => (c.linkPageId === page.id ? { ...c, linkPageId: null } : c)) })),
    }));
    selectPage(neighbour.id);
  };

  const movePage = (delta: -1 | 1) => {
    const target = pageIndex + delta;
    if (target < 0 || target >= board.pages.length) return;
    update((b) => {
      const pages = [...b.pages];
      [pages[pageIndex], pages[target]] = [pages[target], pages[pageIndex]];
      return { ...b, pages };
    });
  };

  const changeGrid = (rows: number, cols: number) => {
    const losesContent = page.cells.some((c, i) => {
      const r = Math.floor(i / page.cols);
      const col = i % page.cols;
      return (r >= rows || col >= cols) && (c.imageId || c.label);
    });
    if (losesContent && !confirm('Se eliminarán celdas con contenido. ¿Continuar?')) return;
    updatePage((p) => resizeGrid(p, rows, cols));
  };

  const handleExport = async () => {
    downloadBlob(await exportBoard(board), `${safeFilename(board.name)}.json`);
  };

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <input
          className="board-name"
          value={board.name}
          maxLength={200}
          onChange={(e) => update((b) => ({ ...b, name: e.target.value }))}
          aria-label="Nombre del panel"
        />
        <span className="status">{rev === savedRev ? 'Guardado' : 'Guardando…'}</span>
        <label className="inline-field">
          Idioma de las descripciones
          <select value={language} disabled={translating} onChange={(e) => void changeLanguage(e.target.value)}>
            {Object.entries(ARASAAC_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {translating && <span className="status">Traduciendo…</span>}
        <span className="spacer" />
        <Link to={`/boards/${board.id}/view?page=${page.id}`}>Ver</Link>
        <Link to={`/boards/${board.id}/print`}>Imprimir</Link>
        <button type="button" onClick={() => void handleExport()}>
          Exportar JSON
        </button>
      </div>

      <div className="editor-body">
        <aside className="panel page-list">
          <h3>Páginas</h3>
          <ol>
            {board.pages.map((p) => (
              <li key={p.id}>
                <button type="button" className={p.id === page.id ? 'active' : ''} onClick={() => selectPage(p.id)}>
                  {p.name}
                </button>
              </li>
            ))}
          </ol>
          <div className="button-column">
            <button type="button" onClick={() => insertPage(createPage(`Página ${board.pages.length + 1}`, page))}>
              + Nueva página
            </button>
            <button type="button" onClick={() => insertPage(duplicatePage(page, `${page.name} (copia)`))}>
              Duplicar página
            </button>
            <div className="button-row">
              <button type="button" onClick={() => movePage(-1)} disabled={pageIndex === 0} aria-label="Subir página">
                ↑
              </button>
              <button type="button" onClick={() => movePage(1)} disabled={pageIndex === board.pages.length - 1} aria-label="Bajar página">
                ↓
              </button>
            </div>
            <button type="button" className="danger" onClick={removePage} disabled={board.pages.length === 1}>
              Eliminar página
            </button>
          </div>
        </aside>

        <SheetViewport page={page}>
          <Sheet page={page} selectedCellId={cellId} onCellClick={(c) => setCellId(c.id)} />
        </SheetViewport>

        <aside className="panel properties">
          <PageSettings page={page} onChange={updatePage} onGridChange={changeGrid} />
          {cell ? (
            <CellSettings
              cell={cell}
              pages={board.pages.filter((p) => p.id !== page.id)}
              onChange={updateCell}
              onPickImage={() => setPickerOpen(true)}
            />
          ) : (
            <p className="hint">Selecciona una celda para editarla.</p>
          )}
        </aside>
      </div>

      {pickerOpen && cell && (
        <ImagePicker
          lang={language}
          onClose={() => setPickerOpen(false)}
          onSelect={(img) => {
            const { id, label } = cell;
            patchCell(id, { imageId: img.id });
            setPickerOpen(false);
            if (!label) void imageLabel(img, language).then((text) => patchCell(id, { label: text }));
          }}
        />
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  limits,
  onChange,
}: {
  label: string;
  value: number;
  limits: { min: number; max: number };
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={limits.min}
        max={limits.max}
        value={value}
        onChange={(e) => {
          const n = e.target.valueAsNumber;
          if (Number.isFinite(n)) onChange(clamp(n, limits.min, limits.max));
        }}
      />
    </label>
  );
}

function PageSettings({
  page,
  onChange,
  onGridChange,
}: {
  page: Page;
  onChange: (fn: (p: Page) => Page) => void;
  onGridChange: (rows: number, cols: number) => void;
}) {
  return (
    <section>
      <h3>Página</h3>
      <label className="field">
        <span>Nombre</span>
        <input value={page.name} maxLength={200} onChange={(e) => onChange((p) => ({ ...p, name: e.target.value }))} />
      </label>
      <label className="field">
        <span>Tamaño</span>
        <select value={page.size} onChange={(e) => onChange((p) => ({ ...p, size: e.target.value as PaperSize }))}>
          {(Object.keys(PAPER_SIZES) as PaperSize[]).map((s) => (
            <option key={s} value={s}>
              {PAPER_SIZES[s].label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Orientación</span>
        <select value={page.orientation} onChange={(e) => onChange((p) => ({ ...p, orientation: e.target.value as Orientation }))}>
          <option value="portrait">Vertical</option>
          <option value="landscape">Horizontal</option>
        </select>
      </label>
      <div className="field-row">
        <NumberField label="Filas" value={page.rows} limits={LIMITS.rows} onChange={(rows) => onGridChange(rows, page.cols)} />
        <NumberField label="Columnas" value={page.cols} limits={LIMITS.cols} onChange={(cols) => onGridChange(page.rows, cols)} />
      </div>
      <div className="field-row">
        <NumberField label="Margen (mm)" value={page.marginMm} limits={LIMITS.marginMm} onChange={(marginMm) => onChange((p) => ({ ...p, marginMm }))} />
        <NumberField label="Separación (mm)" value={page.gapMm} limits={LIMITS.gapMm} onChange={(gapMm) => onChange((p) => ({ ...p, gapMm }))} />
      </div>
      <NumberField label="Tamaño de texto (pt)" value={page.fontSizePt} limits={LIMITS.fontSizePt} onChange={(fontSizePt) => onChange((p) => ({ ...p, fontSizePt }))} />
    </section>
  );
}

function CellSettings({
  cell,
  pages,
  onChange,
  onPickImage,
}: {
  cell: Cell;
  pages: Page[];
  onChange: (patch: Partial<Cell>) => void;
  onPickImage: () => void;
}) {
  const url = useImageUrl(cell.imageId);
  return (
    <section>
      <h3>Celda</h3>
      <div className="cell-preview">{url ? <img src={url} alt="" /> : <span>Sin imagen</span>}</div>
      <div className="button-row">
        <button type="button" className="primary" onClick={onPickImage}>
          Elegir imagen…
        </button>
        <button type="button" onClick={() => onChange({ imageId: null })} disabled={!cell.imageId}>
          Quitar
        </button>
      </div>
      <label className="field">
        <span>Descripción</span>
        <input value={cell.label} maxLength={200} onChange={(e) => onChange({ label: e.target.value })} />
      </label>
      <label className="field">
        <span>Color de fondo</span>
        <input type="color" value={cell.background} onChange={(e) => onChange({ background: e.target.value })} />
      </label>
      <label className="field">
        <span>Al pulsar, ir a</span>
        <select value={cell.linkPageId ?? ''} onChange={(e) => onChange({ linkPageId: e.target.value || null })}>
          <option value="">— Ninguna página —</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="danger"
        onClick={() => onChange({ imageId: null, label: '', linkPageId: null, background: DEFAULT_CELL_BACKGROUND })}
      >
        Vaciar celda
      </button>
    </section>
  );
}
