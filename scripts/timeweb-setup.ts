/*
 Timeweb Cloud setup CLI
 Usage:
   tsx scripts/timeweb-setup.ts check
   tsx scripts/timeweb-setup.ts status
   tsx scripts/timeweb-setup.ts provision --dry-run

 Notes:
 - This CLI is defensive: it validates token and attempts gentle discovery.
 - Actual resource creation requires concrete plan/region IDs; implement when available.
*/

/* eslint-disable no-console */
import { TimewebClient, requireToken } from './timeweb-client';

function parseArgs() {
  const [, , cmd = 'check', ...rest] = process.argv;
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      flags[k] = v ?? true;
    }
  }
  return { cmd, flags };
}

async function main() {
  const { cmd, flags } = parseArgs();
  const token = await requireToken();
  const tw = new TimewebClient(token);

  if (cmd === 'check') {
    const ping = await tw.ping();
    console.log('Ping:', ping.status, ping.text || ping.data);
    const proj = await tw.projects();
    console.log('Projects:', proj.status, proj.ok ? 'OK' : 'ERR');
    if (!proj.ok && proj.status === 401) {
      throw new Error('TIMEWEB_TOKEN invalid or lacks scope (401)');
    }
    console.log('Token looks valid.');
    return;
  }

  if (cmd === 'status') {
    const results: Record<string, any> = {};
    const probes = [
      ['projects', tw.projects()],
      ['regions', tw.listRegions()],
      ['vds_presets', tw.listVdsPresets()],
      ['vds_servers', tw.listVdsServers()],
      ['db_instances', tw.listDbInstances()],
      ['s3_buckets', tw.listS3Buckets()],
    ] as const;

    for (const [name, p] of probes) {
      try {
        const r = await p;
        results[name] = { status: r.status, ok: r.ok, body: r.data ?? r.text };
      } catch (e: any) {
        results[name] = { error: e?.message || String(e) };
      }
    }

    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (cmd === 'provision') {
    const dry = Boolean(flags['dry-run'] ?? true);
    const region = (flags['region'] as string) || process.env.TIMEWEB_REGION || '';
    const preset = (flags['preset'] as string) || process.env.TIMEWEB_VDS_PRESET || '';

    console.log('Provision plan:');
    console.log('  region:', region || '(discover)');
    console.log('  preset:', preset || '(discover)');
    console.log('  dry-run:', dry);

    // Best-effort discovery and guidance
    const regions = await tw.listRegions();
    if (regions.ok) console.log('Available regions discovered'); else console.warn('Regions not discovered:', regions.status);
    const presets = await tw.listVdsPresets();
    if (presets.ok) console.log('Available VDS presets discovered'); else console.warn('VDS presets not discovered:', presets.status);

    if (dry) {
      console.log('Dry-run: skipping actual resource creation.');
      console.log('Set TIMEWEB_REGION, TIMEWEB_VDS_PRESET and rerun without --dry-run when ready.');
      return;
    }

    // Placeholder for actual creation (requires confirmed paths and payloads)
    // const createVds = await tw.post('/api/v1/vds/servers', { region_id: region, preset_id: preset, image: 'ubuntu-22-04', name: 'kamhub-app' });
    // console.log('Create VDS:', createVds.status, createVds.ok ? 'OK' : createVds.text);

    console.log('Provisioning steps are scaffolded. Please configure exact endpoints and IDs.');
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}

main().catch((e) => {
  console.error('[timeweb-setup] failed:', e?.message || e);
  process.exitCode = 1;
});
