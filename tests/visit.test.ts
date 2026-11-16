import { test, expect } from 'vitest'
import { visitEntry } from '../worker/visit'

const page = { accept: 'text/html,application/xhtml+xml', method: 'GET' }
const google = { asOrganization: 'Google LLC', asn: 15169, country: 'US', city: 'Mountain View', clientTcpRtt: 3 }

test('a page visit records the network, page, referrer and country', () => {
  const e = visitEntry('https://ethanctran.dev/google?x=1', { ...page, referer: 'https://example.com/a' }, google)
  expect(e).toEqual({
    event: 'visit',
    path: '/google',
    org: 'Google LLC',
    asn: 15169,
    country: 'US',
    referrer: 'https://example.com/a',
  })
})

test('it never records an IP address, a city, or the query string', () => {
  const e = visitEntry('https://ethanctran.dev/?utm=x', page, { ...google, clientIp: '1.2.3.4' } as never)
  expect(JSON.stringify(e)).not.toMatch(/1\.2\.3\.4|Mountain View|utm/)
})

test('a missing referrer or network is recorded as null, not left out', () => {
  const e = visitEntry('https://ethanctran.dev/', page, undefined)
  expect(e).toMatchObject({ path: '/', org: null, asn: null, country: null, referrer: null })
})

test('files the page loads (scripts, fonts, images) are not counted as visits', () => {
  expect(visitEntry('https://ethanctran.dev/assets/index.js', { accept: '*/*', method: 'GET' }, google)).toBeNull()
  expect(visitEntry('https://ethanctran.dev/me.jpg', { accept: 'image/avif,image/webp,*/*', method: 'GET' }, google)).toBeNull()
})

test('only GET page loads count', () => {
  expect(visitEntry('https://ethanctran.dev/', { ...page, method: 'HEAD' }, google)).toBeNull()
})
