import { useEffect, useState } from 'react';
import { getBoard } from '../db';
import type { Board } from '../types';

export function useBoard(boardId: string | undefined) {
  const [state, setState] = useState<{ id: string; board: Board | null } | null>(null);

  useEffect(() => {
    if (!boardId) return;
    let active = true;
    void getBoard(boardId).then((board) => active && setState({ id: boardId, board: board ?? null }));
    return () => {
      active = false;
    };
  }, [boardId]);

  const loading = !!boardId && state?.id !== boardId;
  return { board: loading ? null : state?.board ?? null, loading };
}
