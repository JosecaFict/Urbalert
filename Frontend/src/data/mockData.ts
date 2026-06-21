/**
 * Datos de referencia de Santa Cruz de la Sierra, Bolivia.
 * Se usan como valores por defecto y sugerencias en formularios y mapas.
 */

export const SANTA_CRUZ_CENTRO = {
  latitud: -17.7833,
  longitud: -63.1821,
  zoom: 13,
}

/** Ubicaciones reales frecuentes en los reclamos. */
export const UBICACIONES_REFERENCIA = [
  'Av. Santos Dumont, 4to anillo',
  'Av. Banzer, 3er anillo',
  'Barrio Equipetrol',
  'Zona Los Lotes',
  'Av. Virgen de Cotoca',
  'Plan 3000',
  'Doble vía La Guardia',
  'Av. Beni',
  'Plaza 24 de Septiembre',
  'Av. Cristo Redentor',
]

/** Frases de ayuda para guiar al ciudadano según la categoría. */
export const AYUDA_CATEGORIA: Record<string, string> = {
  'Baches y daños en calles':
    'Indica el tamaño aproximado del bache y si afecta el tránsito.',
  'Alumbrado público':
    'Menciona cuántos postes están apagados y desde cuándo.',
  'Cables eléctricos expuestos':
    'No te acerques al cable. Describe la ubicación exacta del peligro.',
  'Basura acumulada':
    'Indica hace cuánto tiempo está acumulada y si genera malos olores.',
  'Alcantarillado y drenaje':
    'Describe si hay rebalse, malos olores o riesgo de inundación.',
  Inundaciones: 'Indica el nivel del agua y si hay viviendas afectadas.',
  'Árboles y áreas verdes':
    'Indica si el árbol representa un peligro de caída o ya cayó.',
  'Fugas de agua':
    'Menciona si es agua potable y cuánta agua se está desperdiciando.',
  'Plazas y parques':
    'Describe qué mobiliario o área está dañada.',
}
