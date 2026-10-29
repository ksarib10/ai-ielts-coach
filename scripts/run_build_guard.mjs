import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const dirIdx = args.indexOf('--dir');
const targetDir = dirIdx !== -1 && args[dirIdx + 1] ? args[dirIdx + 1] : 'dist';
const noAllowMocks = args.includes('--no-allow-mocks');

function tryPythonGuard() {
  for (const cmd of ['python', 'python3']) {
    const res = spawnSync(cmd, ['scripts/verify_build_assets.py', ...args], {
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    if (!res.error) {
      process.exit(res.status ?? 1);
    }
  }
}

tryPythonGuard();

// Fallback Node.js fail-closed implementation when Python binary is absent in container
const TRUSTED_MOCK_FIXTURE_HASHES = {
  'mock_awl_group.json': '7cac0c7f8f87ba3877d23f8a643eb4c125573b4e55d4262815aead414e332dfa',
  'mock_credits_entry.json': '43ada3a27cb301cfc566265b1f1a58797e93113cc6bd0e77f820734cf981a52c',
  'mock_idiom_card.json': 'cf8615f987a401d3314e6024d790823e15550e4f57f8c52f7e3efafd90077791',
  'mock_linking_card.json': 'c1d96d0dd2eb8b53385cd91350cb5ea2e193b7b4365374ffb66b3d5a90258e1d',
  'mock_oxford_card.json': 'c199ec5ca90197b2c3e0504198c952405ce3e12c757c4d241233e8ad704a3085',
  'mock_phrasal_card.json': 'b3459a3bbc8d2e9901c103e50d3d6de0116f7eb9ba9b59efd326a066c1189ab3',
  'mock_search_results.json': '7f8faa714c5a3abe65d50b92ac1f85ea40a296947accf1f52705247432908648',
  'mock_variant_card.json': '5c7a542b2fbbe7602eaf4f3755068ea036fb843a89a6711cb5aa0bf9581d2230'
};

const ALLOWED_WEB_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.css', '.svg', '.ico', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2']);
const TRUSTED_MEDIA = { 'listening-diagnostic.wav': 'RIFF', 'sample-reading.pdf': '%PDF-' };

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`[BLOCKED] ${targetDir} [MISSING_BUILD_DIRECTORY]`);
  process.exit(1);
}

const allFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else allFiles.push(full);
  }
}
walk(targetDir);

if (allFiles.length === 0) {
  console.error(`[BLOCKED] ${targetDir} [EMPTY_BUILD_DIRECTORY]`);
  process.exit(1);
}

const forbiddenRegexes = [
  /(?<![A-Za-z0-9_])OXF_(?:ENT|LEX|SRC)_[A-Za-z0-9_]+/,
  /(?<![A-Za-z0-9_])AWL_(?:FAM|GRP)_[A-Za-z0-9_]+/,
  /(?<![A-Za-z0-9_])IDI_(?:HB|GRP)_[A-Za-z0-9_]+/,
  /(?<![A-Za-z0-9_])LNK_(?:ENT|SRC)_[A-Za-z0-9_]+/,
  /(?<![A-Za-z0-9_])PV_(?:ENT|SRC)_[A-Za-z0-9_]+/,
  /(?<![A-Za-z0-9_])VAR_PAIR_[A-Za-z0-9_]+/,
  /Oxford_Vocabulary_Data_Complete\.csv/,
  /academic_word_families\.csv/,
  /ielts_idioms_handbook\.csv/,
  /ielts_linking_words\.csv/,
  /ielts_phrasal_verbs\.csv/,
  /british_american_words\.csv/,
  /idioms_grouped\.csv/,
  /PRIVATE_CANONICAL/
];

for (const fpath of allFiles) {
  const fname = path.basename(fpath);
  const ext = path.extname(fname).toLowerCase();
  const buf = fs.readFileSync(fpath);

  if (
    (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07)) ||
    (buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b)
  ) {
    console.error(`[BLOCKED] ${fpath} [COMPRESSED_OR_BINARY_CONTAINER_PAYLOAD]`);
    process.exit(1);
  }

  if (fname.startsWith('mock_') && ext === '.json') {
    if (noAllowMocks) {
      console.error(`[BLOCKED] ${fpath} [MOCK_FIXTURES_DISABLED]`);
      process.exit(1);
    }
    const expected = TRUSTED_MOCK_FIXTURE_HASHES[fname];
    const rawHash = crypto.createHash('sha256').update(buf).digest('hex');
    const lfHash = crypto.createHash('sha256').update(Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')).digest('hex');
    if (!expected || (rawHash !== expected && lfHash !== expected)) {
      console.error(`[BLOCKED] ${fpath} [UNTRUSTED_MOCK_FILE]`);
      process.exit(1);
    }
    continue;
  }

  if (fname in TRUSTED_MEDIA) {
    if (!buf.subarray(0, TRUSTED_MEDIA[fname].length).toString('ascii').startsWith(TRUSTED_MEDIA[fname])) {
      console.error(`[BLOCKED] ${fpath} [INVALID_MEDIA_HEADER]`);
      process.exit(1);
    }
    continue;
  }

  if (!ALLOWED_WEB_EXT.has(ext)) {
    console.error(`[BLOCKED] ${fpath} [UNAPPROVED_ASSET_EXTENSION]`);
    process.exit(1);
  }

  const text = buf.toString('utf8');
  for (const reg of forbiddenRegexes) {
    if (reg.test(text)) {
      console.error(`[BLOCKED] ${fpath} [EMBEDDED_PROPRIETARY_DATA]`);
      process.exit(1);
    }
  }
}
console.log('[ASSET SECURITY GUARD] All checks passed. Build output verified clean.');

