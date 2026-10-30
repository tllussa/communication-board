import { useState } from 'react';
import { ArasaacSearch } from '../components/ArasaacSearch';
import { LibraryBrowser } from '../components/LibraryBrowser';

export function LibraryView() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="page-content library-view">
      <section>
        <h2>Mi biblioteca</h2>
        <LibraryBrowser mode="manage" refreshKey={refreshKey} />
      </section>
      <section>
        <h2>Añadir desde ARASAAC</h2>
        <ArasaacSearch onAdded={() => setRefreshKey((k) => k + 1)} />
      </section>
    </div>
  );
}
