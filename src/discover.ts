import { fetchText } from './fetch.ts';
import { rssUrl } from './sourceforge.ts';
import type { Channel } from './types.ts';

const VERSION_FROM_RSS = /\/(\d+(?:\.\d+)+(?:[a-z]+\d+)?)\/nsis-\1\.zip/g;

const TARGETS: ReadonlyArray<{ major: number; channel: Channel }> = [
  { major: 2, channel: 'stable' },
  { major: 3, channel: 'stable' },
  { major: 3, channel: 'prerelease' },
];

async function discoverOne(
  major: number,
  channel: Channel,
): Promise<string[]> {
  const xml = await fetchText(rssUrl(major, channel));
  if (!xml) return [];
  const versions = new Set<string>();
  for (const m of xml.matchAll(VERSION_FROM_RSS)) {
    versions.add(m[1]!);
  }
  return [...versions];
}

export async function discover(): Promise<Map<string, Channel>> {
  const result = new Map<string, Channel>();
  for (const { major, channel } of TARGETS) {
    const versions = await discoverOne(major, channel);
    for (const v of versions) {
      if (!result.has(v)) result.set(v, channel);
    }
  }
  return result;
}
