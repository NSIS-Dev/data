export type Channel = 'stable' | 'prerelease';

export interface Hashes {
  sha1: string;
  sha256: string;
  sha512: string;
}

export interface Artifact {
  url: string;
  filename: string;
  size: number;
  hashes: Hashes;
}

export interface VersionArtifacts {
  zip: Artifact;
  sourceTarball: Artifact | null;
}

export interface VersionEntry {
  version: string;
  major: number;
  channel: Channel;
  preRelease: string | null;
  releasedAt: string | null;
  artifacts: VersionArtifacts;
}

export interface LatestChannel {
  v2: string | null;
  v3: string | null;
}

export interface Latest {
  stable: LatestChannel;
  prerelease: LatestChannel;
}

export interface Dataset {
  $schema: string;
  generatedAt: string;
  source: string;
  versions: Record<string, VersionEntry>;
  latest: Latest;
}

export interface SeedEntry {
  version: string;
  channel: Channel;
}

export interface Seed {
  versions: SeedEntry[];
}
