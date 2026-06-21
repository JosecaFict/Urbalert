const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function parse(fecha: string | null | undefined): Date | null {
  if (!fecha) return null
  const d = new Date(fecha)
  return isNaN(d.getTime()) ? null : d
}

/** Formato corto: 07/06/2026 */
export function formatDate(fecha: string | null | undefined): string {
  const d = parse(fecha)
  if (!d) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

/** Formato con hora: 07/06/2026 14:35 */
export function formatDateTime(fecha: string | null | undefined): string {
  const d = parse(fecha)
  if (!d) return '—'
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(fecha)} ${hh}:${min}`
}

/** Formato largo: 7 de junio de 2026 */
export function formatDateLong(fecha: string | null | undefined): string {
  const d = parse(fecha)
  if (!d) return '—'
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

/** Tiempo relativo: "hace 3 horas" */
export function timeAgo(fecha: string | null | undefined): string {
  const d = parse(fecha)
  if (!d) return '—'
  const segundos = Math.floor((Date.now() - d.getTime()) / 1000)
  if (segundos < 60) return 'hace un momento'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias} día${dias > 1 ? 's' : ''}`
  return formatDate(fecha)
}
