#!/usr/bin/env node
/*
  Exports all Vercel projects' env vars (production/preview/development)
  across personal scope and teams, using one or more tokens (comma-separated) in VERCEL_TOKENS.
  Outputs files in ./vercel_exports/<scope>__<project>.<target>.env
*/

const fs = await import('node:fs/promises');
const path = await import('node:path');

const TOKENS = (process.env.VERCEL_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
if (TOKENS.length === 0) {
  console.error('[ERROR] Set VERCEL_TOKENS="tok1,tok2"');
  process.exit(1);
}

const BASE = 'https://api.vercel.com';

async function api(token, url, opts = {}) {
  const u = url.startsWith('http') ? url : `${BASE}${url}`;
  const res = await fetch(u, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

function sanitize(s) {
  return s.replace(/[^a-zA-Z0-9_-]+/g, '-');
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeEnvFile(dir, scopeName, projectName, target, pairs) {
  const file = path.join(dir, `${sanitize(scopeName)}__${sanitize(projectName)}.${target}.env`);
  const lines = Object.entries(pairs).map(([k, v]) => `${k}=${String(v).replace(/\n/g, '\\n')}`);
  await fs.writeFile(file, lines.join('\n') + '\n', 'utf8');
  return file;
}

async function exportForToken(token) {
  const outDir = path.join(process.cwd(), 'vercel_exports');
  await ensureDir(outDir);

  // personal user
  const me = await api(token, '/v2/user');
  const userId = me.user?.id || me.user?.uid || me.id || me.uid || 'me';
  const userName = me.user?.username || me.user?.name || me.name || 'personal';

  // teams (paginate)
  let teams = [];
  try {
    let next = `${BASE}/v2/teams?limit=100`;
    while (next) {
      const res = await api(token, next);
      teams.push(...(res.teams || []));
      const pg = res.pagination || {};
      next = pg.next ? `${BASE}${pg.next}` : '';
    }
  } catch (_) {}

  const scopes = [{ id: null, name: userName }].concat(teams.map(t => ({ id: t.id, name: t.slug || t.name || t.id })));

  let totalFiles = 0;
  for (const scope of scopes) {
    // list projects (paginate)
    let projects = [];
    try {
      let url = `/v9/projects?limit=100${scope.id ? `&teamId=${scope.id}` : ''}`;
      while (url) {
        const res = await api(token, url);
        projects.push(...(res.projects || res || []));
        const pg = res.pagination || {};
        url = pg.next ? pg.next : '';
      }
    } catch (e) {
      console.warn(`[warn] Failed to list projects for scope ${scope.name}: ${e.message}`);
      continue;
    }

    for (const p of projects) {
      const projectIdOrName = p.id || p.name;
      const projectName = p.name || p.id;
      try {
        const envRes = await api(token, `/v9/projects/${projectIdOrName}/env?decrypt=true${scope.id ? `&teamId=${scope.id}` : ''}`);
        const envs = envRes.envs || envRes || [];
        const byTarget = { production: {}, preview: {}, development: {} };
        for (const e of envs) {
          const key = e.key;
          const val = e.value;
          const targets = Array.isArray(e.target) ? e.target : [e.target];
          for (const t of targets) {
            if (t && byTarget[t]) byTarget[t][key] = val;
          }
        }
        for (const t of ['production', 'preview', 'development']) {
          if (Object.keys(byTarget[t]).length) {
            const file = await writeEnvFile(outDir, scope.name, projectName, t, byTarget[t]);
            console.log(`[export] ${scope.name}/${projectName} -> ${file}`);
            totalFiles++;
          }
        }
      } catch (e) {
        console.warn(`[warn] Failed to export envs for ${scope.name}/${projectName}: ${e.message}`);
      }
    }
  }
  return totalFiles;
}

(async () => {
  let sum = 0;
  for (const tok of TOKENS) {
    try {
      const n = await exportForToken(tok);
      sum += n;
    } catch (e) {
      console.error(`[ERROR] token export failed: ${e.message}`);
    }
  }
  console.log(`[done] total files: ${sum}, see ./vercel_exports`);
})();
