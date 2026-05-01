import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Ajv, type ErrorObject } from 'ajv';
import _addFormats from 'ajv-formats';

import schemaJson from '../schema/versions.schema.json' with { type: 'json' };
import type { Dataset } from './types.ts';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DATA_PATH = path.join(ROOT, 'data', 'versions.json');

const addFormats = _addFormats as unknown as (ajv: Ajv) => Ajv;

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateFn = ajv.compile(schemaJson as object);

export function validateDataset(data: unknown): ErrorObject[] | null {
  const ok = validateFn(data);
  return ok ? null : (validateFn.errors ?? []);
}

export function assertDataset(data: unknown): asserts data is Dataset {
  const errors = validateDataset(data);
  if (errors) {
    throw new Error(
      `dataset failed schema validation:\n${formatErrors(errors)}`,
    );
  }
}

export function formatErrors(errors: ErrorObject[]): string {
  return errors
    .map((e) => `  ${e.instancePath || '/'} ${e.message ?? ''}`)
    .join('\n');
}

async function main(): Promise<void> {
  const raw = await readFile(DATA_PATH, 'utf-8');
  const data: unknown = JSON.parse(raw);
  const errors = validateDataset(data);
  if (errors) {
    console.error('validation failed:');
    console.error(formatErrors(errors));
    process.exit(1);
  }
  const dataset = data as Dataset;
  const count = Object.keys(dataset.versions).length;
  console.log(`ok: ${count} versions validate against the schema`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
