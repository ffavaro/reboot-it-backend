const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function ciudadDeLaBase(base: string, configurada?: string): string {
  if (configurada?.trim()) return configurada.trim();
  const partes = base
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.length >= 3 ? partes.slice(-2).join(', ') : '';
}

export function agregarCiudad(direccion: string, ciudad: string): string {
  const limpia = direccion.trim();
  if (!limpia || !ciudad) return limpia;
  const localidad = normalizar(ciudad.split(',')[0].trim());
  return normalizar(limpia).includes(localidad)
    ? limpia
    : `${limpia}, ${ciudad}`;
}

export function linkGoogleMaps(paradas: string[], destino: string): string {
  const params = new URLSearchParams({
    api: '1',
    destination: destino,
    travelmode: 'driving',
  });
  if (paradas.length) params.set('waypoints', paradas.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function linkEmbebido(
  origen: string,
  paradas: string[],
  destino: string,
  embedKey: string,
): string {
  if (!embedKey) {
    const params = new URLSearchParams({
      output: 'embed',
      hl: 'es',
      saddr: origen,
      daddr: [...paradas, destino].join(' to:'),
    });
    return `https://maps.google.com/maps?${params.toString()}`;
  }

  if (origen === destino && !paradas.length) {
    const params = new URLSearchParams({
      key: embedKey,
      q: destino,
      language: 'es',
      region: 'ar',
    });
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }

  const params = new URLSearchParams({
    key: embedKey,
    origin: origen,
    destination: destino,
    mode: 'driving',
    language: 'es',
    region: 'ar',
  });
  if (paradas.length) params.set('waypoints', paradas.join('|'));
  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}
