import { useEffect, useState } from 'react';
import { getImage } from '../db';

const cache = new Map<string, Promise<string | null>>();

export function getImageUrl(id: string) {
  let url = cache.get(id);
  if (!url) {
    url = getImage(id).then((img) => (img ? URL.createObjectURL(img.blob) : null));
    cache.set(id, url);
  }
  return url;
}

export function forgetImageUrl(id: string) {
  const url = cache.get(id);
  if (!url) return;
  cache.delete(id);
  void url.then((u) => u && URL.revokeObjectURL(u));
}

export function useImageUrl(id: string | null) {
  const [state, setState] = useState<{ id: string; url: string | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void getImageUrl(id).then((url) => active && setState({ id, url }));
    return () => {
      active = false;
    };
  }, [id]);

  return id && state?.id === id ? state.url : null;
}
