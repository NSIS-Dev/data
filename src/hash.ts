import { createHash } from 'node:crypto';

import type { Hashes } from './types.ts';

export function computeHashes(buf: Buffer): Hashes {
  return {
    sha1: createHash('sha1').update(buf).digest('hex'),
    sha256: createHash('sha256').update(buf).digest('hex'),
    sha512: createHash('sha512').update(buf).digest('hex'),
  };
}
