import type { Channel } from './types.ts';

function projectDir(major: number, channel: Channel): string {
  return channel === 'prerelease'
    ? `NSIS%20${major}%20Pre-release`
    : `NSIS%20${major}`;
}

export function zipUrl(version: string, major: number, channel: Channel): string {
  return `https://downloads.sourceforge.net/project/nsis/${projectDir(major, channel)}/${version}/nsis-${version}.zip`;
}

export function srcTarballUrl(
  version: string,
  major: number,
  channel: Channel,
): string {
  return `https://downloads.sourceforge.net/project/nsis/${projectDir(major, channel)}/${version}/nsis-${version}-src.tar.bz2`;
}

export function rssUrl(major: number, channel: Channel): string {
  const path = channel === 'prerelease'
    ? `/NSIS ${major} Pre-release`
    : `/NSIS ${major}`;
  return `https://sourceforge.net/projects/nsis/rss?path=${encodeURIComponent(path)}`;
}
