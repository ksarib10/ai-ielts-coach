"""
verify_build_assets.py - Hardened Fail-Closed Build-Time Asset Exclusion & Security Guard

Enforces a strict default-deny policy for data, archive, and binary assets in public Vite/React build outputs (e.g. dist/):
  1. Fail-closed if the target build directory does not exist or is empty.
  2. Magic-byte header inspection on ALL files to block compressed archives (ZIP, GZIP, BZIP2, XZ, 7z, ZSTD, RAR, TAR)
     and binary databases/containers (SQLite, Parquet, Arrow) even when disguised under arbitrary filenames/extensions
     such as 'assets.dat', 'segment.bin', or 'bundle.js'.
  3. Default-deny all unexpected data files (.json, .csv, .tsv, .jsonl, .sqlite, .db, etc.) and binary/archive
     extensions (.zip, .gz, .bin, .dat, .pak, .wasm, etc.), enforcing a strict web-asset extension allowlist.
  4. Explicit trusted-fixture allowlist: Only the 8 checked-in DEVELOPMENT_FIXTURES/mock_*.json
     files matching their exact SHA-256 hashes are permitted as JSON data assets.
  5. Universal content scan across all text-bearing files (.js, .ts, .json, .html, .css, .svg, etc.)
     for canonical IDs (OXF_ENT_*, AWL_FAM_*, IDI_HB_*, LNK_ENT_*, PV_ENT_*, VAR_PAIR_*),
     source provenance filenames, and source-derived lexical record structures.

Note: This technical build guard prevents accidental bundling or static exposure of protected
datasets; formal legal/licensing clearance remains a separate owner-managed prelaunch gate.

Usage:
    python scripts/verify_build_assets.py [--dir <path_to_scan>] [--allow-mocks | --no-allow-mocks]
"""

import os
import sys
import argparse
import fnmatch
import hashlib
import re
from pathlib import Path

# Explicit SHA-256 allowlist for the 8 publication-safe synthetic mock fixtures
TRUSTED_MOCK_FIXTURE_HASHES = {
    "mock_awl_group.json": "7cac0c7f8f87ba3877d23f8a643eb4c125573b4e55d4262815aead414e332dfa",
    "mock_credits_entry.json": "43ada3a27cb301cfc566265b1f1a58797e93113cc6bd0e77f820734cf981a52c",
    "mock_idiom_card.json": "cf8615f987a401d3314e6024d790823e15550e4f57f8c52f7e3efafd90077791",
    "mock_linking_card.json": "c1d96d0dd2eb8b53385cd91350cb5ea2e193b7b4365374ffb66b3d5a90258e1d",
    "mock_oxford_card.json": "c199ec5ca90197b2c3e0504198c952405ce3e12c757c4d241233e8ad704a3085",
    "mock_phrasal_card.json": "b3459a3bbc8d2e9901c103e50d3d6de0116f7eb9ba9b59efd326a066c1189ab3",
    "mock_search_results.json": "7f8faa714c5a3abe65d50b92ac1f85ea40a296947accf1f52705247432908648",
    "mock_variant_card.json": "5c7a542b2fbbe7602eaf4f3755068ea036fb843a89a6711cb5aa0bf9581d2230",
}

# Approved legacy diagnostic static media files in public/ with required magic byte prefixes
TRUSTED_PUBLIC_MEDIA_FILES = {
    "listening-diagnostic.wav": b"RIFF",
    "sample-reading.pdf": b"%PDF-",
}

# File patterns strictly forbidden in public production builds
FORBIDDEN_FILE_PATTERNS = [
    "*.csv",
    "*.tsv",
    "*.jsonl",
    "*.ndjson",
    "*.parquet",
    "*.sqlite",
    "*.sqlite3",
    "*.db",
    "*.zip",
    "*.gz",
    "*.tgz",
    "*.tar",
    "*.bz2",
    "*.xz",
    "*.7z",
    "*.rar",
    "*.zst",
    "*.lz4",
    "*.br",
    "*.bin",
    "*.dat",
    "*.pak",
    "*.bundle",
    "*.raw",
    "*.feather",
    "*.arrow",
    "*.orc",
    "*.avro",
    "*.hdf5",
    "*.h5",
    "*.pkl",
    "*.pickle",
    "*.npy",
    "*.npz",
    "Oxford_Vocabulary_Data_Complete.*",
    "academic_word_families.*",
    "ielts_idioms_handbook.*",
    "ielts_linking_words.*",
    "ielts_phrasal_verbs.*",
    "british_american_words.*",
    "idioms_grouped.*",
    "*oxford_canonical*",
    "*awl_canonical*",
    "*idioms_handbook_canonical*",
    "*linking_words_canonical*",
    "*phrasal_verbs_canonical*",
    "*british_american_canonical*",
    "*quarantine_record*",
    "*quarantined*",
    "*private_canonical*",
    "oxford_detail_shard_*.json",
    "letter_*.json",
    "sublist_*.json",
    "linking_words_guide.json",
    "phrasal_verbs_by_topic.json",
    "british_american_pairs.json",
    "idioms_by_difficulty.json",
]

# Protected canonical ID and provenance signatures forbidden across ALL files
FORBIDDEN_CONTENT_SIGNATURES = [
    r"(?<![A-Za-z0-9_])OXF_(?:ENT|LEX|SRC)_[A-Za-z0-9_]+",
    r"(?<![A-Za-z0-9_])AWL_(?:FAM|GRP)_[A-Za-z0-9_]+",
    r"(?<![A-Za-z0-9_])IDI_(?:HB|GRP)_[A-Za-z0-9_]+",
    r"(?<![A-Za-z0-9_])LNK_(?:ENT|SRC)_[A-Za-z0-9_]+",
    r"(?<![A-Za-z0-9_])PV_(?:ENT|SRC)_[A-Za-z0-9_]+",
    r"(?<![A-Za-z0-9_])VAR_PAIR_[A-Za-z0-9_]+",
    r"Oxford_Vocabulary_Data_Complete\.csv",
    r"academic_word_families\.csv",
    r"ielts_idioms_handbook\.csv",
    r"ielts_linking_words\.csv",
    r"ielts_phrasal_verbs\.csv",
    r"british_american_words\.csv",
    r"idioms_grouped\.csv",
    r"unverified_attestation",
    r"PRIVATE_CANONICAL",
]

# Lexical structure keys forbidden in non-trusted files (e.g., renamed JSON dictionaries or embedded JS objects)
FORBIDDEN_LEXICAL_STRUCTURE_SIGNATURES = [
    r'"headword_clean"\s*:',
    r'"word_family_forms"\s*:',
    r'"collocations_raw"\s*:',
    r'"ielts_usage_raw"\s*:',
    r'"british_word_primary"\s*:',
    r'"sample_sentence_ielts"\s*:',
    r'"sense_verification_status"\s*:',
    r'"study_groups_10"\s*:',
    r'"headword"\s*:\s*"[^"]+"\s*,\s*"meaning"\s*:',
    r'"word"\s*:\s*"[^"]+"\s*,\s*"definition"\s*:',
]

DATA_EXTENSIONS = {
    ".json", ".csv", ".tsv", ".jsonl", ".ndjson", ".xml", ".yaml", ".yml",
    ".sqlite", ".sqlite3", ".db", ".parquet"
}

ARCHIVE_AND_BINARY_EXTENSIONS = {
    ".zip", ".gz", ".tgz", ".tar", ".bz2", ".xz", ".7z", ".rar", ".zst", ".lz4", ".br",
    ".bin", ".dat", ".pak", ".bundle", ".raw", ".feather", ".arrow", ".orc", ".avro",
    ".hdf5", ".h5", ".pkl", ".pickle", ".npy", ".npz", ".pb", ".onnx", ".wasm",
    ".exe", ".dll", ".so", ".dylib"
}

ALLOWED_WEB_BUILD_EXTENSIONS = {
    ".html", ".htm", ".js", ".mjs", ".cjs", ".css", ".svg",
    ".ico", ".png", ".jpg", ".jpeg", ".webp", ".woff", ".woff2"
}

TEXT_SCAN_EXTENSIONS = {
    ".js", ".mjs", ".cjs", ".ts", ".jsx", ".tsx",
    ".json", ".html", ".htm", ".css", ".svg", ".txt", ".md", ".map", ".xml", ".yaml", ".yml"
}

# Magic byte signatures for compressed archives and binary data containers
MAGIC_BYTE_SIGNATURES = [
    (b"PK\x03\x04", "ZIP archive header (PK\\x03\\x04)"),
    (b"PK\x05\x06", "ZIP empty archive header (PK\\x05\\x06)"),
    (b"PK\x07\x08", "ZIP spanned archive header (PK\\x07\\x08)"),
    (b"\x1f\x8b", "GZIP compressed payload (\\x1f\\x8b)"),
    (b"BZh", "BZIP2 compressed payload (BZh)"),
    (b"\xfd7zXZ\x00", "XZ compressed payload (\\xfd7zXZ)"),
    (b"7z\xbc\xaf\x27\x1c", "7-Zip archive header"),
    (b"\x28\xb5\x2f\xfd", "Zstandard compressed payload"),
    (b"Rar!\x1a\x07", "RAR archive header"),
    (b"SQLite format 3\x00", "SQLite 3 database header"),
    (b"PAR1", "Apache Parquet columnar data header"),
    (b"ARROW1", "Apache Arrow binary data header"),
]


def compute_normalized_sha256(fpath: Path) -> tuple[str, str]:
    """Returns (raw_sha256, lf_normalized_sha256) to handle platform line-ending differences safely."""
    raw_bytes = fpath.read_bytes()
    raw_hash = hashlib.sha256(raw_bytes).hexdigest()
    lf_bytes = raw_bytes.replace(b"\r\n", b"\n")
    lf_hash = hashlib.sha256(lf_bytes).hexdigest()
    return raw_hash, lf_hash


def is_trusted_mock_fixture(fpath: Path) -> tuple[bool, str]:
    """Checks if a file is one of the 8 allowlisted mock fixtures with an exact matching SHA-256 hash."""
    fname = fpath.name
    if fname not in TRUSTED_MOCK_FIXTURE_HASHES:
        return False, f"Filename '{fname}' is not in TRUSTED_MOCK_FIXTURE_HASHES"
    expected_hash = TRUSTED_MOCK_FIXTURE_HASHES[fname]
    raw_hash, lf_hash = compute_normalized_sha256(fpath)
    if raw_hash != expected_hash and lf_hash != expected_hash:
        return False, f"SHA-256 mismatch for '{fname}' (expected {expected_hash[:12]}..., got {lf_hash[:12]}...)"
    return True, "Trusted mock fixture verified"


def detect_magic_byte_violation(fpath: Path) -> str | None:
    """Inspects file header bytes to detect compressed archives or binary databases regardless of file extension."""
    try:
        with fpath.open("rb") as f:
            header = f.read(512)
    except Exception as e:
        return f"Unreadable binary header: {e}"

    for magic, label in MAGIC_BYTE_SIGNATURES:
        if header.startswith(magic):
            return label

    # Check POSIX tar 'ustar' magic at offset 257
    if len(header) >= 262 and header[257:262] == b"ustar":
        return "TAR archive header (ustar at offset 257)"

    return None


def scan_directory(target_dir: Path, allow_mocks: bool = True) -> list:
    """
    Scans target_dir using fail-closed, default-deny rules.
    Returns a list of violation dicts.
    """
    violations = []

    # 1. Fail-closed on missing or non-directory target
    if not target_dir.exists() or not target_dir.is_dir():
        violations.append({
            "file": str(target_dir),
            "type": "MISSING_BUILD_DIRECTORY",
            "matched_rule": "Target build directory must exist and be a directory",
            "absolute_path": str(target_dir.resolve() if target_dir.exists() else target_dir)
        })
        return violations

    all_files = []
    for root, _, files in os.walk(target_dir):
        for fname in files:
            all_files.append(Path(root) / fname)

    # 2. Fail-closed on empty build directory
    if len(all_files) == 0:
        violations.append({
            "file": str(target_dir),
            "type": "EMPTY_BUILD_DIRECTORY",
            "matched_rule": "Target build directory contains zero files",
            "absolute_path": str(target_dir.resolve())
        })
        return violations

    content_regexes = [re.compile(sig) for sig in FORBIDDEN_CONTENT_SIGNATURES]
    lexical_regexes = [re.compile(sig) for sig in FORBIDDEN_LEXICAL_STRUCTURE_SIGNATURES]

    for fpath in all_files:
        fname = fpath.name
        ext = fpath.suffix.lower()
        rel_path = fpath.relative_to(target_dir).as_posix()

        # 3. Magic-byte inspection on EVERY file (catches disguised zip/gzip/sqlite/parquet payloads)
        magic_hit = detect_magic_byte_violation(fpath)
        if magic_hit:
            violations.append({
                "file": rel_path,
                "type": "COMPRESSED_OR_BINARY_CONTAINER_PAYLOAD",
                "matched_rule": magic_hit,
                "absolute_path": str(fpath)
            })
            continue

        # 4. Check explicit forbidden filename patterns
        matched_forbidden_name = False
        for pattern in FORBIDDEN_FILE_PATTERNS:
            if fnmatch.fnmatch(fname, pattern) or fnmatch.fnmatch(rel_path, pattern):
                violations.append({
                    "file": rel_path,
                    "type": "FORBIDDEN_FILE_PATTERN",
                    "matched_rule": pattern,
                    "absolute_path": str(fpath)
                })
                matched_forbidden_name = True
                break

        if matched_forbidden_name:
            continue

        # 5. Reject any archive or binary container extension
        if ext in ARCHIVE_AND_BINARY_EXTENSIONS:
            violations.append({
                "file": rel_path,
                "type": "FORBIDDEN_ARCHIVE_OR_BINARY_PAYLOAD",
                "matched_rule": f"Default-deny policy for binary/archive extension ({ext})",
                "absolute_path": str(fpath)
            })
            continue

        # 6. Always scan text-bearing files (including mock_*.json) for forbidden canonical IDs & source names
        if ext in TEXT_SCAN_EXTENSIONS:
            try:
                raw_bytes = fpath.read_bytes()
                if b"\x00" in raw_bytes:
                    violations.append({
                        "file": rel_path,
                        "type": "DISGUISED_BINARY_IN_TEXT_ASSET",
                        "matched_rule": "Null byte (\\x00) detected inside text asset",
                        "absolute_path": str(fpath)
                    })
                    continue
                content = raw_bytes.decode("utf-8", errors="ignore")
            except Exception as e:
                violations.append({
                    "file": rel_path,
                    "type": "UNREADABLE_ASSET",
                    "matched_rule": str(e),
                    "absolute_path": str(fpath)
                })
                continue

            for reg in content_regexes:
                if reg.search(content):
                    violations.append({
                        "file": rel_path,
                        "type": "EMBEDDED_PROPRIETARY_DATA",
                        "matched_rule": reg.pattern,
                        "absolute_path": str(fpath)
                    })
                    break

        # 7. Handle mock_*.json files strictly via TRUSTED_MOCK_FIXTURE_HASHES
        if fname.startswith("mock_") and ext == ".json":
            if not allow_mocks:
                violations.append({
                    "file": rel_path,
                    "type": "MOCK_FIXTURES_DISABLED",
                    "matched_rule": "--no-allow-mocks is set",
                    "absolute_path": str(fpath)
                })
                continue

            is_trusted, reason = is_trusted_mock_fixture(fpath)
            if not is_trusted:
                violations.append({
                    "file": rel_path,
                    "type": "UNTRUSTED_MOCK_FILE",
                    "matched_rule": reason,
                    "absolute_path": str(fpath)
                })
                continue

            # Valid, hash-verified trusted mock fixture; skip non-mock lexical key check
            continue

        # 8. Default-deny any other data file (.json, .csv, .xml, etc.) in public build output
        if ext in DATA_EXTENSIONS:
            violations.append({
                "file": rel_path,
                "type": "UNEXPECTED_DATA_ASSET",
                "matched_rule": f"Default-deny policy for unverified data file ({ext})",
                "absolute_path": str(fpath)
            })
            continue

        # 9. Verify approved public media files or enforce strict web extension allowlist
        if fname in TRUSTED_PUBLIC_MEDIA_FILES:
            expected_magic = TRUSTED_PUBLIC_MEDIA_FILES[fname]
            try:
                with fpath.open("rb") as f:
                    prefix = f.read(len(expected_magic))
                if prefix != expected_magic:
                    violations.append({
                        "file": rel_path,
                        "type": "INVALID_MEDIA_HEADER",
                        "matched_rule": f"Expected header {expected_magic!r} for {fname}",
                        "absolute_path": str(fpath)
                    })
                    continue
            except Exception as e:
                violations.append({
                    "file": rel_path,
                    "type": "UNREADABLE_ASSET",
                    "matched_rule": str(e),
                    "absolute_path": str(fpath)
                })
                continue
        elif ext not in ALLOWED_WEB_BUILD_EXTENSIONS:
            violations.append({
                "file": rel_path,
                "type": "UNAPPROVED_ASSET_EXTENSION",
                "matched_rule": f"Extension '{ext or '<none>'}' is not in ALLOWED_WEB_BUILD_EXTENSIONS",
                "absolute_path": str(fpath)
            })
            continue

        # 10. Scan non-trusted text files for embedded lexical schema structures
        if ext in TEXT_SCAN_EXTENSIONS:
            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                for lreg in lexical_regexes:
                    if lreg.search(content):
                        violations.append({
                            "file": rel_path,
                            "type": "FORBIDDEN_LEXICAL_STRUCTURE",
                            "matched_rule": lreg.pattern,
                            "absolute_path": str(fpath)
                        })
                        break
            except Exception:
                pass

    return violations


def main():
    parser = argparse.ArgumentParser(description="Hardened fail-closed build assets exclusion guard.")
    parser.add_argument("--dir", default="dist", help="Build directory to scan (default: dist)")
    parser.add_argument(
        "--allow-mocks",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Allow the 8 hash-verified DEVELOPMENT_FIXTURES/mock_*.json files (default: True)"
    )
    args = parser.parse_args()

    scan_dir = Path(args.dir)
    print(f"[ASSET SECURITY GUARD] Scanning '{scan_dir}' (fail-closed, default-deny data/binary policy)...")

    violations = scan_directory(scan_dir, allow_mocks=args.allow_mocks)

    if violations:
        print("\n" + "=" * 70)
        print("SECURITY VIOLATION DETECTED: BUILD FAILED ASSET EXCLUSION GUARD")
        print("=" * 70)
        for v in violations:
            print(f"  [BLOCKED] {v['file']} [{v['type']}] (rule: {v['matched_rule']})")
        print("\nAction Required:")
        print("  1. Target build directory must exist and be non-empty.")
        print("  2. Proprietary CSVs, canonical datasets, subsets, archives (.zip/.gz),")
        print("     arbitrary binaries (.bin/.dat), and unverified JSON data files")
        print("     are strictly prohibited in public build outputs.")
        print("  3. Only approved web assets and the 8 hash-verified DEVELOPMENT_FIXTURES/mock_*.json")
        print("     fixtures are allowed.")
        print("=" * 70 + "\n")
        sys.exit(1)
    else:
        print("[ASSET SECURITY GUARD] All checks passed. Build output verified clean.")
        sys.exit(0)


if __name__ == "__main__":
    main()

