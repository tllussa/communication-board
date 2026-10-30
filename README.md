# Communication Board

[Català](#català) · [Español](#español) · [English](#english)

---

## Català

Plataforma web per crear **plafons de comunicació** destinats a persones amb discapacitat cognitiva, amb pictogrames d'[ARASAAC](https://arasaac.org).

### Funcionalitats

- Plafons amb diverses pàgines imprimibles de mida configurable (A6, A5, A4, A3, A2, Carta, Legal) i orientació vertical o horitzontal.
- Quadrícula personalitzable per pàgina: files, columnes, marge, separació i mida del text.
- Cada cel·la conté un pictograma amb una descripció a sota, color de fons i enllaç opcional a una altra pàgina.
- Mode de visualització per navegar pels plafons tocant les cel·les enllaçades.
- Impressió: cada pàgina s'imprimeix amb la seva mida i orientació.
- Biblioteca d'imatges: cerca a ARASAAC i pujada d'imatges pròpies des de fitxers (PNG, JPG, GIF, WEBP, SVG; màx. 5 MB).
- Idioma de les descripcions configurable per plafó (català, castellà, basc, gallec, anglès, francès…), amb traducció automàtica dels pictogrames ARASAAC.
- Exportació i importació de plafons en format JSON (inclou les imatges).

### Requisits

- [Node.js](https://nodejs.org) 20 o superior.

### Ús en local

```bash
npm install
npm run dev
```

Obre http://localhost:5173.

### Desplegament

```bash
npm run build
```

Publica el contingut de la carpeta `dist/` en qualsevol allotjament estàtic (GitHub Pages, Netlify, Vercel, Azure Static Web Apps, IIS, nginx…). Cal servir-lo per **HTTPS** (excepte a `localhost`).

### On es desen les dades

Els plafons i la biblioteca es desen al **navegador de cada usuari** (IndexedDB). No hi ha servidor: cada usuari té els seus propis plafons. Per fer còpies de seguretat o compartir-los, utilitza **Exportar JSON** / **Importar JSON**. Si s'esborren les dades del navegador, es perden els plafons.

---

## Español

Plataforma web para crear **paneles de comunicación** destinados a personas con discapacidad cognitiva, con pictogramas de [ARASAAC](https://arasaac.org).

### Funcionalidades

- Paneles con varias páginas imprimibles de tamaño configurable (A6, A5, A4, A3, A2, Carta, Legal) y orientación vertical u horizontal.
- Cuadrícula personalizable por página: filas, columnas, margen, separación y tamaño del texto.
- Cada celda contiene un pictograma con una descripción debajo, color de fondo y enlace opcional a otra página.
- Modo de visualización para navegar por los paneles pulsando las celdas enlazadas.
- Impresión: cada página se imprime con su tamaño y orientación.
- Biblioteca de imágenes: búsqueda en ARASAAC y subida de imágenes propias desde archivos (PNG, JPG, GIF, WEBP, SVG; máx. 5 MB).
- Idioma de las descripciones configurable por panel (catalán, español, euskera, gallego, inglés, francés…), con traducción automática de los pictogramas ARASAAC.
- Exportación e importación de paneles en formato JSON (incluye las imágenes).

### Requisitos

- [Node.js](https://nodejs.org) 20 o superior.

### Uso en local

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

### Despliegue

```bash
npm run build
```

Publica el contenido de la carpeta `dist/` en cualquier alojamiento estático (GitHub Pages, Netlify, Vercel, Azure Static Web Apps, IIS, nginx…). Debe servirse por **HTTPS** (excepto en `localhost`).

### Dónde se guardan los datos

Los paneles y la biblioteca se guardan en el **navegador de cada usuario** (IndexedDB). No hay servidor: cada usuario tiene sus propios paneles. Para hacer copias de seguridad o compartirlos, usa **Exportar JSON** / **Importar JSON**. Si se borran los datos del navegador, se pierden los paneles.

---

## English

Web platform for creating **communication boards** for people with cognitive disabilities, using [ARASAAC](https://arasaac.org) pictograms.

### Features

- Boards with multiple printable pages of configurable size (A6, A5, A4, A3, A2, Letter, Legal) and portrait or landscape orientation.
- Customizable grid per page: rows, columns, margin, gap and text size.
- Each cell holds a pictogram with a label below it, background colour and an optional link to another page.
- View mode to navigate the boards by tapping linked cells.
- Printing: each page prints with its own size and orientation.
- Image library: search ARASAAC and upload your own images from files (PNG, JPG, GIF, WEBP, SVG; max. 5 MB).
- Per-board label language (Catalan, Spanish, Basque, Galician, English, French…), with automatic translation of ARASAAC pictograms.
- Board export and import as JSON (images included).

### Requirements

- [Node.js](https://nodejs.org) 20 or later.

### Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Deployment

```bash
npm run build
```

Publish the contents of the `dist/` folder to any static host (GitHub Pages, Netlify, Vercel, Azure Static Web Apps, IIS, nginx…). It must be served over **HTTPS** (except on `localhost`).

### Where data is stored

Boards and the image library are stored in **each user's browser** (IndexedDB). There is no server: every user has their own boards. To back them up or share them, use **Export JSON** / **Import JSON**. Clearing the browser data deletes the boards.

---

## ARASAAC

Pictogramas / Pictogrames / Pictograms: Sergio Palao. Origen / Origin: [ARASAAC](https://arasaac.org). Licencia / Llicència / License: [CC BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/). Propiedad / Propietat / Owner: Gobierno de Aragón (España).
