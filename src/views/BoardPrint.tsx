import { Link, useParams } from 'react-router-dom';
import { Sheet } from '../components/Sheet';
import { useBoard } from '../hooks/useBoard';
import { NotFound } from './BoardEditor';

export function BoardPrint() {
  const { boardId } = useParams();
  const { board, loading } = useBoard(boardId);

  if (loading) return <p className="empty">Cargando…</p>;
  if (!board) return <NotFound />;

  return (
    <div className="print-view">
      <div className="editor-toolbar no-print">
        <strong>{board.name}</strong>
        <span className="hint">
          {board.pages.length} {board.pages.length === 1 ? 'página' : 'páginas'}. Cada página se imprime con su propio tamaño y
          orientación (márgenes del navegador: ninguno).
        </span>
        <span className="spacer" />
        <Link to={`/boards/${board.id}/edit`}>Editar</Link>
        <button type="button" className="primary" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
      <div className="print-stack">
        {board.pages.map((page) => (
          <Sheet key={page.id} page={page} />
        ))}
      </div>
    </div>
  );
}
