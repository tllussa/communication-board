import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Sheet, SheetViewport } from '../components/Sheet';
import { useBoard } from '../hooks/useBoard';
import type { Cell } from '../types';
import { NotFound } from './BoardEditor';

export function BoardViewer() {
  const { boardId } = useParams();
  const { board, loading } = useBoard(boardId);
  const [params, setParams] = useSearchParams();

  if (loading) return <p className="empty">Cargando…</p>;
  if (!board) return <NotFound />;

  const page = board.pages.find((p) => p.id === params.get('page')) ?? board.pages[0];
  const index = board.pages.indexOf(page);
  // Pushes a history entry so the browser "back" button returns to the previous page.
  const goTo = (pageId: string) => setParams({ page: pageId });

  const handleCellClick = (cell: Cell) => {
    if (cell.linkPageId && board.pages.some((p) => p.id === cell.linkPageId)) goTo(cell.linkPageId);
  };

  return (
    <div className="viewer">
      <div className="editor-toolbar">
        <strong>{board.name}</strong>
        <button type="button" onClick={() => goTo(board.pages[index - 1].id)} disabled={index === 0}>
          ← Anterior
        </button>
        <select value={page.id} onChange={(e) => goTo(e.target.value)} aria-label="Página">
          {board.pages.map((p, i) => (
            <option key={p.id} value={p.id}>
              {i + 1}. {p.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => goTo(board.pages[index + 1].id)} disabled={index === board.pages.length - 1}>
          Siguiente →
        </button>
        <span className="spacer" />
        <Link to={`/boards/${board.id}/edit`}>Editar</Link>
        <Link to={`/boards/${board.id}/print`}>Imprimir</Link>
      </div>
      <SheetViewport page={page}>
        <Sheet page={page} onCellClick={handleCellClick} />
      </SheetViewport>
    </div>
  );
}
