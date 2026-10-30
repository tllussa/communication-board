import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet } from '../components/Sheet';
import { deleteBoard, listBoards, saveBoard } from '../db';
import { downloadBlob, exportBoard, importBoard, safeFilename } from '../exportImport';
import { createBoard, duplicateBoard } from '../model';
import { pageDimensions, PX_PER_MM } from '../paper';
import type { Board } from '../types';

const PREVIEW_HEIGHT_PX = 150;

export function BoardsList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const refresh = () => void listBoards().then(setBoards);
  useEffect(refresh, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const board = createBoard(name.trim() || 'Nuevo panel');
    await saveBoard(board);
    navigate(`/boards/${board.id}/edit`);
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      await saveBoard(await importBoard(file));
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo importar el panel');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const handleExport = async (board: Board) => {
    downloadBlob(await exportBoard(board), `${safeFilename(board.name)}.json`);
  };

  const handleDuplicate = async (board: Board) => {
    await saveBoard(duplicateBoard(board, `${board.name} (copia)`));
    refresh();
  };

  const handleDelete = async (board: Board) => {
    if (!confirm(`¿Eliminar el panel "${board.name}"?`)) return;
    await deleteBoard(board.id);
    refresh();
  };

  return (
    <div className="page-content">
      <div className="toolbar">
        <form className="toolbar" onSubmit={(e) => void create(e)}>
          <input placeholder="Nombre del nuevo panel" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          <button type="submit" className="primary">
            Crear panel
          </button>
        </form>
        <span className="spacer" />
        <button type="button" onClick={() => importRef.current?.click()}>
          Importar JSON…
        </button>
        <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(e) => void handleImport(e.target.files?.[0])} />
      </div>

      {boards.length === 0 ? (
        <p className="empty">Todavía no hay paneles. Crea uno nuevo o importa un archivo JSON.</p>
      ) : (
        <div className="board-grid">
          {boards.map((board) => (
            <article key={board.id} className="board-card">
              <Link to={`/boards/${board.id}/view`} className="board-preview">
                <BoardPreview board={board} />
              </Link>
              <h3>{board.name}</h3>
              <p className="meta">
                {board.pages.length} {board.pages.length === 1 ? 'página' : 'páginas'} · {new Date(board.updatedAt).toLocaleString('es')}
              </p>
              <div className="actions">
                <Link to={`/boards/${board.id}/view`}>Ver</Link>
                <Link to={`/boards/${board.id}/edit`}>Editar</Link>
                <Link to={`/boards/${board.id}/print`}>Imprimir</Link>
                <button type="button" onClick={() => void handleExport(board)}>Exportar</button>
                <button type="button" onClick={() => void handleDuplicate(board)}>Duplicar</button>
                <button type="button" className="danger" onClick={() => void handleDelete(board)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function BoardPreview({ board }: { board: Board }) {
  const page = board.pages[0];
  if (!page) return null;
  const { height } = pageDimensions(page.size, page.orientation);
  return (
    <div className="sheet-zoom" style={{ zoom: PREVIEW_HEIGHT_PX / (height * PX_PER_MM) }}>
      <Sheet page={page} />
    </div>
  );
}
