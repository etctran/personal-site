import { visitEntry, visitMessage, humanEntry, humanMessage, type RequestOrigin } from './visit'

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

/**
 * Serves the built site unchanged, and writes one log line per page visit
 * (see visit.ts). Read them in the Cloudflare dashboard under
 * Workers & Pages → personal-site → Logs.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cf = (request as Request & { cf?: RequestOrigin }).cf
    // the page's "a real person went in" signal (src/beacon.ts)
    if (new URL(request.url).pathname === '/_human') {
      if (request.method === 'POST') {
        try {
          const entry = humanEntry(await request.text(), cf)
          if (entry) console.log(humanMessage(entry))
        } catch {
          // logging must never break the site
        }
      }
      return new Response(null, { status: 204 })
    }
    const response = await env.ASSETS.fetch(request)
    try {
      const entry = visitEntry(
        request.url,
        {
          method: request.method,
          accept: request.headers.get('accept'),
          referer: request.headers.get('referer'),
        },
        cf,
      )
      if (entry) console.log(visitMessage(entry))
    } catch {
      // logging must never break the site
    }
    return response
  },
}
