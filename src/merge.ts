import type { Dataset, Latest, VersionEntry } from './types.ts';
import { compareNsisVersions } from './version.ts';

function pickLatest(
  entries: VersionEntry[],
  pred: (e: VersionEntry) => boolean,
): string | null {
  const filtered = entries.filter(pred);
  if (filtered.length === 0) return null;
  filtered.sort((a, b) => compareNsisVersions(a.version, b.version));
  return filtered.at(-1)!.version;
}

function computeLatest(versions: Record<string, VersionEntry>): Latest {
  const entries = Object.values(versions);
  return {
    stable: {
      v2: pickLatest(entries, (e) => e.channel === 'stable' && e.major === 2),
      v3: pickLatest(entries, (e) => e.channel === 'stable' && e.major === 3),
    },
    prerelease: {
      v2: pickLatest(
        entries,
        (e) => e.channel === 'prerelease' && e.major === 2,
      ),
      v3: pickLatest(
        entries,
        (e) => e.channel === 'prerelease' && e.major === 3,
      ),
    },
  };
}

function sortVersions(
  versions: Record<string, VersionEntry>,
): Record<string, VersionEntry> {
  const sorted: Record<string, VersionEntry> = {};
  for (const k of Object.keys(versions).sort(compareNsisVersions)) {
    sorted[k] = versions[k]!;
  }
  return sorted;
}

export function mergeDataset(
  existing: Dataset,
  newEntries: VersionEntry[],
): Dataset {
  const versions: Record<string, VersionEntry> = { ...existing.versions };
  for (const entry of newEntries) {
    versions[entry.version] = entry;
  }
  const sorted = sortVersions(versions);
  return {
    $schema: existing.$schema,
    generatedAt: new Date().toISOString(),
    source: existing.source,
    versions: sorted,
    latest: computeLatest(sorted),
  };
}
