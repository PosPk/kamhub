/*
  Comprehensive integration test for `guide` role covering core entities & business processes.
  - Assumes environment variable `API_URL` is set (http://localhost:3000 by default)
  - Uses native fetch (node 18+). Designed for vitest/jest runners.
*/

import { describe, it, expect, beforeAll } from 'vitest'

const API_URL = process.env.API_URL || 'http://localhost:3000'

let token: string
let guideId: string
let tourAssignmentId: string
let tourId: string

async function req(path: string, opts: any = {}) {
  const headers = opts.headers || {}
  if (token) headers['authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { headers: { 'content-type': 'application/json', ...headers }, ...opts })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

describe('Guide role — end-to-end journey', () => {
  beforeAll(() => {
    // noop
  })

  it('Register guide account', async () => {
    const payload = { name: 'Test Guide', email: `guide+test@kamhub.local`, password: 'Password123!', role: 'guide' }
    const { status, body } = await req('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    expect([200,201]).toContain(status)
    expect(body).toHaveProperty('user')
    guideId = body.user?.id || body.user?.userId
  })

  it('Login as guide', async () => {
    const { status, body } = await req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: `guide+test@kamhub.local`, password: 'Password123!' }) })
    expect(status).toBe(200)
    expect(body).toHaveProperty('token')
    token = body.token
  })

  it('Fetch available assignments (tours) and accept one', async () => {
    const list = await req('/api/guide/assignments?status=open')
    expect(list.status).toBe(200)
    const assignments = list.body?.items || []
    if (assignments.length === 0) {
      // If none available, try to create a draft tour (if API allows)
      const create = await req('/api/tours', { method: 'POST', body: JSON.stringify({ title: 'Test Tour by Guide', startAt: new Date().toISOString(), capacity: 10 }) })
      expect([200,201]).toContain(create.status)
      tourId = create.body?.id
      // create an assignment for the tour (admin/auto endpoint)
      const assign = await req('/api/guide/assignments', { method: 'POST', body: JSON.stringify({ tourId: tourId }) })
      expect([200,201]).toContain(assign.status)
      tourAssignmentId = assign.body?.id
    } else {
      tourAssignmentId = assignments[0].id
    }
    // Accept assignment
    const accept = await req(`/api/guide/assignments/${tourAssignmentId}/accept`, { method: 'POST' })
    expect([200,204]).toContain(accept.status)
  })

  it('Prepare tour: update itinerary and materials', async () => {
    // Update itinerary
    const update = await req(`/api/guide/assignments/${tourAssignmentId}/itinerary`, { method: 'PUT', body: JSON.stringify({ itinerary: [{ time: '09:00', activity: 'Meet at point A' }] }) })
    expect([200,204]).toContain(update.status)
    // Upload materials (if endpoint exists)
    const mat = await req(`/api/guide/assignments/${tourAssignmentId}/materials`, { method: 'POST', body: JSON.stringify({ materials: ['safety.pdf'] }) })
    expect([200,201,204]).toContain(mat.status)
  })

  it('Check booked participants and contact them', async () => {
    const part = await req(`/api/guide/assignments/${tourAssignmentId}/participants`)
    expect([200,204]).toContain(part.status)
    // If participants list exists, send a quick message (if API supports messaging)
    if (part.body?.length) {
      const msg = await req(`/api/messages`, { method: 'POST', body: JSON.stringify({ to: part.body[0].userId, text: 'Hello, see you at meeting point at 09:00' }) })
      expect([200,201,204,202]).toContain(msg.status)
    }
  })

  it('Start tour (mark in-progress) and record events', async () => {
    const start = await req(`/api/guide/assignments/${tourAssignmentId}/start`, { method: 'POST' })
    expect([200,204]).toContain(start.status)
    // Add event (photo, note)
    const event = await req(`/api/guide/assignments/${tourAssignmentId}/events`, { method: 'POST', body: JSON.stringify({ type: 'checkpoint', note: 'Arrived to viewpoint' }) })
    expect([200,201]).toContain(event.status)
  })

  it('Handle incident report (safety) if API present', async () => {
    const report = await req(`/api/guide/assignments/${tourAssignmentId}/incidents`, { method: 'POST', body: JSON.stringify({ severity: 'low', text: 'Minor slip, no injury' }) })
    expect([200,201,204,404]).toContain(report.status)
  })

  it('Complete tour and collect feedback', async () => {
    const complete = await req(`/api/guide/assignments/${tourAssignmentId}/complete`, { method: 'POST' })
    expect([200,204]).toContain(complete.status)
    // Optionally request feedback
    const feed = await req(`/api/guide/assignments/${tourAssignmentId}/request-feedback`, { method: 'POST' })
    expect([200,204,404]).toContain(feed.status)
  })

  it('View earnings and payouts', async () => {
    const pay = await req('/api/guide/earnings')
    expect([200,204]).toContain(pay.status)
  })

  it('Update profile, certifications and availability', async () => {
    const upd = await req('/api/guide/profile', { method: 'PUT', body: JSON.stringify({ bio: 'Experienced guide (test)', certifications: ['first-aid'], available: true }) })
    expect([200,204]).toContain(upd.status)
  })

  it('Logout and cleanup (optional delete test account)', async () => {
    const lo = await req('/api/auth/logout', { method: 'POST' })
    expect([200,204,401]).toContain(lo.status)
    // Attempt delete (if allowed in test env)
    const del = await req(`/api/admin/users/${guideId}`, { method: 'DELETE' })
    expect([200,204,403,404]).toContain(del.status)
  })
})
