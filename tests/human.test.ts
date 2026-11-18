import { test, expect, vi } from 'vitest'
import { humanEntry, humanMessage } from '../worker/visit'
import { reportHuman, HUMAN_ENDPOINT } from '../src/beacon'

const google = { asOrganization: 'Google LLC', asn: 15169, country: 'US' }

/* ---- worker: the log line ---- */
test('pressing Enter logs a human line with network, page and how they came in', () => {
  const e = humanEntry('{"how":"enter","path":"/google"}', google)
  expect(e).toEqual({ event: 'human', how: 'enter', path: '/google', org: 'Google LLC', asn: 15169, country: 'US' })
  expect(humanMessage(e!)).toBe('Human /google · Google LLC (AS15169) · US · pressed Enter')
})

test('a visitor who skipped the intro is logged when they first scroll, click or press a key', () => {
  const e = humanEntry('{"how":"engaged","path":"/"}', undefined)!
  expect(humanMessage(e)).toBe('Human / · unknown network · unknown country · scrolled or clicked')
})

test('junk is rejected: bad JSON, unknown "how", oversized bodies, odd paths', () => {
  expect(humanEntry('not json', google)).toBeNull()
  expect(humanEntry('{"how":"hacked","path":"/"}', google)).toBeNull()
  expect(humanEntry('{"how":"enter","path":"https://evil.example"}', google)).toBeNull()
  expect(humanEntry('{"how":"enter","path":"/' + 'a'.repeat(200) + '"}', google)).toBeNull()
  expect(humanEntry('x'.repeat(2000), google)).toBeNull()
})

test('the logged path drops any query string and keeps only plain characters', () => {
  expect(humanEntry('{"how":"enter","path":"/stripe?ref=x"}', google)?.path).toBe('/stripe')
  expect(humanEntry('{"how":"enter","path":"/a<b>"}', google)).toBeNull()
})

/* ---- page: send the signal once ---- */
test('reportHuman sends one beacon with how and the landing page, and only once per page load', () => {
  const beacon = vi.fn(() => true)
  const send = reportHuman({ sendBeacon: beacon }, '/google')
  send('enter')
  send('engaged')
  send('enter')
  expect(beacon).toHaveBeenCalledTimes(1)
  expect(beacon).toHaveBeenCalledWith(HUMAN_ENDPOINT, JSON.stringify({ how: 'enter', path: '/google' }))
})

test('reportHuman never throws, even without sendBeacon', () => {
  const send = reportHuman({}, '/')
  expect(() => send('enter')).not.toThrow()
})
