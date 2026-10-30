const API = 'https://api.arasaac.org/v1';

export interface ArasaacResult {
  id: number;
  keywords: string[];
}

interface ArasaacPictogram {
  _id: number;
  keywords?: { keyword?: string }[];
}

export async function searchArasaac(term: string, lang = 'es', signal?: AbortSignal): Promise<ArasaacResult[]> {
  const res = await fetch(`${API}/pictograms/${lang}/search/${encodeURIComponent(term)}`, { signal });
  // The API answers 404 when there are no matches.
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`ARASAAC respondió ${res.status}`);
  const data = (await res.json()) as ArasaacPictogram[];
  return data
    .filter((p) => Number.isInteger(p._id))
    .map((p) => ({
      id: p._id,
      keywords: (p.keywords ?? []).map((k) => k.keyword).filter((k): k is string => !!k),
    }));
}

export const ARASAAC_LANGUAGES: Record<string, string> = {
  es: 'Español',
  ca: 'Català',
  eu: 'Euskara',
  gl: 'Galego',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português',
  ro: 'Română',
  pl: 'Polski',
  ru: 'Русский',
  ar: 'العربية',
  zh: '中文',
};

export const DEFAULT_LANGUAGE = 'es';

export function isArasaacLanguage(lang: unknown): lang is string {
  return typeof lang === 'string' && Object.hasOwn(ARASAAC_LANGUAGES, lang);
}

/** Main keyword of a pictogram in the given language, or null if it has none. */
export async function getArasaacKeyword(id: number, lang: string): Promise<string | null> {
  const res = await fetch(`${API}/pictograms/${lang}/${id}`);
  if (!res.ok) return null;
  const data = (await res.json()) as ArasaacPictogram;
  return data.keywords?.find((k) => k.keyword)?.keyword ?? null;
}

export function arasaacThumbUrl(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
}

export async function downloadArasaac(id: number): Promise<Blob> {
  const res = await fetch(`${API}/pictograms/${id}?download=false&resolution=500`);
  if (!res.ok) throw new Error(`No se pudo descargar el pictograma ${id}`);
  return res.blob();
}

export const ARASAAC_ATTRIBUTION =
  'Pictogramas: Sergio Palao. Origen: ARASAAC (https://arasaac.org). Licencia: CC (BY-NC-SA). Propiedad: Gobierno de Aragón (España).';
