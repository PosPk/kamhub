/*
 Timeweb Cloud manage CLI (read-only helpers)
 Usage:
   tsx scripts/timeweb-manage.ts list
   tsx scripts/timeweb-manage.ts project
*/

/* eslint-disable no-console */
import { TimewebClient, requireToken } from './timeweb-client';

function parseArgs() {
  const [, , cmd = 'list'] = process.argv;
  return { cmd };
}

async function main() {
  const { cmd } = parseArgs();
  const token = await requireToken();
  const tw = new TimewebClient(token);

  if (cmd === 'project') {
    const r = await tw.projects();
    console.log('projects:', r.status, r.ok ? r.data : r.text);
    return;
  }

  if (cmd === 'list') {
    const items: Record<string, any> = {};
    const [regions, vdsServers, s3Buckets, dbInstances] = await Promise.all([
      tw.listRegions().catch((e) => ({ error: e?.message || String(e) })),
      tw.listVdsServers().catch((e) => ({ error: e?.message || String(e) })),
      tw.listS3Buckets().catch((e) => ({ error: e?.message || String(e) })),
      tw.listDbInstances().catch((e) => ({ error: e?.message || String(e) })),
    ]);
    items.regions = regions;
    items.vds_servers = vdsServers;
    items.s3_buckets = s3Buckets;
    items.db_instances = dbInstances;
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}

main().catch((e) => {
  console.error('[timeweb-manage] failed:', e?.message || e);
  process.exitCode = 1;
});
