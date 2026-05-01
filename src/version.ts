const PRE_KIND_ORDER: Record<string, number> = { a: 0, b: 1, rc: 2 };

export interface ParsedVersion {
  num: number[];
  pre: { kind: 'a' | 'b' | 'rc' | null; n: number };
}

export function parseNsisVersion(v: string): ParsedVersion {
  const m = v.match(/^(\d+(?:\.\d+)*)([a-z]+)?(\d+)?$/);
  if (!m) throw new Error(`unparseable NSIS version: ${v}`);
  const numPart = m[1]!;
  const kindPart = m[2];
  const nPart = m[3];

  const num = numPart.split('.').map((s) => Number(s));
  const kind =
    kindPart === 'a' || kindPart === 'b' || kindPart === 'rc' ? kindPart : null;
  if (kindPart && kind === null) {
    throw new Error(`unknown pre-release kind '${kindPart}' in version ${v}`);
  }
  const n = nPart ? Number(nPart) : 0;
  return { num, pre: { kind, n } };
}

export function compareNsisVersions(a: string, b: string): number {
  const pa = parseNsisVersion(a);
  const pb = parseNsisVersion(b);

  const len = Math.max(pa.num.length, pb.num.length);
  for (let i = 0; i < len; i++) {
    const av = pa.num[i] ?? 0;
    const bv = pb.num[i] ?? 0;
    if (av !== bv) return av - bv;
  }

  if (pa.pre.kind === null && pb.pre.kind === null) return 0;
  if (pa.pre.kind === null) return 1;
  if (pb.pre.kind === null) return -1;

  const ka = PRE_KIND_ORDER[pa.pre.kind]!;
  const kb = PRE_KIND_ORDER[pb.pre.kind]!;
  if (ka !== kb) return ka - kb;
  return pa.pre.n - pb.pre.n;
}

export function majorOf(version: string): number {
  return parseNsisVersion(version).num[0]!;
}

export function preReleaseSuffix(version: string): string | null {
  const { pre } = parseNsisVersion(version);
  return pre.kind ? `${pre.kind}${pre.n}` : null;
}
