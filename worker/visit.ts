/** What Cloudflare tells the Worker about where a request came from (the parts this site reads). */
export interface RequestOrigin {
  asOrganization?: string
  asn?: number
  country?: string
}

export interface Visit {
  event: 'visit'
  path: string
  org: string | null
  asn: number | null
  country: string | null
  referrer: string | null
}

/**
 * The log line for one page visit: which network it came from (e.g. "Google
 * LLC"), the page, the referrer and the country. Company-level only: no IP
 * address, city or query string is ever recorded. Returns null for anything
 * that is not a page load (scripts, fonts, images, HEAD requests).
 */
export function visitEntry(
  url: string,
  req: { accept?: string | null; method: string; referer?: string | null },
  cf: RequestOrigin | undefined,
): Visit | null {
  if (req.method !== 'GET' || !(req.accept ?? '').includes('text/html')) return null
  return {
    event: 'visit',
    path: new URL(url).pathname,
    org: cf?.asOrganization ?? null,
    asn: cf?.asn ?? null,
    country: cf?.country ?? null,
    referrer: req.referer ?? null,
  }
}

/** One readable line per visit, which is what the Cloudflare log list shows, e.g. "Visit /google · Google LLC (AS15169) · US · from: direct". */
export function visitMessage(v: Visit): string {
  const network = v.org ? `${v.org}${v.asn ? ` (AS${v.asn})` : ''}` : 'unknown network'
  return `Visit ${v.path} · ${network} · ${v.country ?? 'unknown country'} · from: ${v.referrer ?? 'direct'}`
}

export type HumanHow = 'enter' | 'engaged'

export interface Human {
  event: 'human'
  how: HumanHow
  path: string
  org: string | null
  asn: number | null
  country: string | null
}

const HOW_TEXT: Record<HumanHow, string> = { enter: 'pressed Enter', engaged: 'scrolled or clicked' }

/**
 * The log line for a real person going into the site, from the page's
 * beacon body `{"how": "enter" | "engaged", "path": "/..."}`. Bots load
 * pages but rarely press Enter or scroll, so these lines are people.
 * Anything malformed returns null and is not logged.
 */
export function humanEntry(body: string, cf: RequestOrigin | undefined): Human | null {
  if (body.length > 400) return null
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    return null
  }
  const { how, path } = (data ?? {}) as { how?: unknown; path?: unknown }
  if (how !== 'enter' && how !== 'engaged') return null
  if (typeof path !== 'string') return null
  const clean = path.split('?')[0].split('#')[0]
  if (!/^\/[A-Za-z0-9._~\/-]{0,99}$/.test(clean)) return null
  return {
    event: 'human',
    how,
    path: clean,
    org: cf?.asOrganization ?? null,
    asn: cf?.asn ?? null,
    country: cf?.country ?? null,
  }
}

/** e.g. "Human /google · Google LLC (AS15169) · US · pressed Enter" */
export function humanMessage(h: Human): string {
  const network = h.org ? `${h.org}${h.asn ? ` (AS${h.asn})` : ''}` : 'unknown network'
  return `Human ${h.path} · ${network} · ${h.country ?? 'unknown country'} · ${HOW_TEXT[h.how]}`
}
