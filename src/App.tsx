import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { ARASAAC_ATTRIBUTION } from './arasaac';
import { printStyles } from './paper';
import { BoardEditor } from './views/BoardEditor';
import { BoardPrint } from './views/BoardPrint';
import { BoardsList } from './views/BoardsList';
import { BoardViewer } from './views/BoardViewer';
import { LibraryView } from './views/LibraryView';

const PRINT_CSS = printStyles();

export function App() {
  return (
    <HashRouter>
      <style>{PRINT_CSS}</style>
      <div className="app">
        <header className="app-header no-print">
          <span className="logo">Paneles de comunicación</span>
          <nav>
            <NavLink to="/" end>
              Mis paneles
            </NavLink>
            <NavLink to="/library">Biblioteca de imágenes</NavLink>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<BoardsList />} />
            <Route path="/library" element={<LibraryView />} />
            <Route path="/boards/:boardId/edit" element={<BoardEditor />} />
            <Route path="/boards/:boardId/view" element={<BoardViewer />} />
            <Route path="/boards/:boardId/print" element={<BoardPrint />} />
          </Routes>
        </main>
        <footer className="app-footer no-print">{ARASAAC_ATTRIBUTION}</footer>
      </div>
    </HashRouter>
  );
}
