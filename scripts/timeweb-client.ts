/*
 Timeweb Cloud API Client (minimal, robust)
 - Auth: Bearer TIMEWEB_TOKEN
 - Base URL: https://api.timeweb.cloud
 - Provides GET/POST/PATCH/DELETE helpers + a few discovery helpers
*/

/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_URL = process.env.TIMEWEB_API_BASE_URL || 'https://api.timeweb.cloud';

export class TimewebClient {
  private token: string;
  private baseUrl: string;

  constructor(token = process.env.TIMEWEB_TOKEN || '', baseUrl = BASE_URL) {
    if (!token) {
      throw new Error('TIMEWEB_TOKEN is not set. Provide it via env or secrets.');
    }
    this.token = token;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private headers(extra?: Record<string, string>) {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...extra,
    } as Record<string, string>;
  }

  private async request<T = any>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null; text?: string; }>{
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    let body: any = null;
    try {
      if (contentType.includes('application/json')) body = await res.json();
      else body = await res.text();
    } catch {
      body = null;
    }
    return { ok: res.ok, status: res.status, data: (typeof body === 'string' ? null : body), text: (typeof body === 'string' ? body : undefined) };
  }

  async get<T = any>(path: string, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'GET', headers: this.headers(headers) });
  }

  async post<T = any>(path: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'POST', headers: this.headers(headers), body: body ? JSON.stringify(body) : undefined });
  }

  async patch<T = any>(path: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'PATCH', headers: this.headers(headers), body: body ? JSON.stringify(body) : undefined });
  }

  async del<T = any>(path: string, headers?: Record<string, string>) {
    return this.request<T>(path, { method: 'DELETE', headers: this.headers(headers) });
  }

  // Health and discovery helpers
  async ping() {
    // Public welcome endpoint (no auth)
    return this.request('/');
  }

  async projects() {
    // Auth required; used as a token sanity check
    return this.get('/api/v1/projects');
  }

  // Best-effort discovery: these may vary across API versions. We handle 404/401 gracefully.
  async listVdsPresets() { return this.get('/api/v1/vds/presets'); }
  async listVdsServers() { return this.get('/api/v1/vds/servers'); }
  async listRegions() { return this.get('/api/v1/regions'); }
  async listS3Buckets() { return this.get('/api/v1/s3/buckets'); }
  async listDbInstances() { return this.get('/api/v1/databases/instances'); }
}

export async function requireToken(): Promise<string> {
  const token = process.env.TIMEWEB_TOKEN || '';
  if (!token) throw new Error('TIMEWEB_TOKEN is not set.');
  return token;
}
