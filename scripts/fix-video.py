#!/usr/bin/env python3
"""
Prepare a video file for clean web embedding.

Performs (idempotently):
  1. Web-optimization (moves the moov atom to the front via qtfaststart)
  2. Brand patch: rewrites a non-web-friendly major_brand (e.g. 'qt  ')
     to 'mp42' so Chrome/Firefox accept the file
  3. Renames .mov / .MOV -> .mp4

Usage: py -3.12 scripts/fix-video.py <path-to-video>

Requires: qtfaststart (pip install qtfaststart)
"""
import shutil
import subprocess
import sys
from pathlib import Path

WEB_FRIENDLY_BRANDS = {b'mp42', b'mp41', b'isom', b'avc1'}


def faststart(p: Path) -> None:
    tmp = p.with_name(p.name + '.tmp')
    r = subprocess.run(
        [sys.executable, '-m', 'qtfaststart', str(p), str(tmp)],
        capture_output=True, text=True,
    )
    if r.returncode == 0:
        shutil.move(str(tmp), str(p))
        print("  faststart: moov atom moved to front")
        return
    if tmp.exists():
        tmp.unlink()
    msg = (r.stderr + r.stdout).lower()
    if 'setup for streaming' in msg:
        print("  faststart: already web-optimized")
    else:
        print(f"  faststart: ERROR - {r.stderr.strip()}")


def patch_brand(p: Path) -> None:
    with open(p, 'r+b') as f:
        f.seek(4)
        if f.read(4) != b'ftyp':
            print("  brand: skipped (no ftyp box)")
            return
        major = f.read(4)
        if major in WEB_FRIENDLY_BRANDS:
            print(f"  brand: already '{major.decode(errors='replace').strip()}'")
            return
        f.seek(8)
        f.write(b'mp42')
        f.seek(16)
        compat = f.read(4)
        if compat == major:
            f.seek(16)
            f.write(b'mp42')
        print(f"  brand: '{major.decode(errors='replace').strip()}' -> 'mp42'")


def rename_to_mp4(p: Path) -> Path:
    if p.suffix.lower() != '.mov':
        return p
    new = p.with_suffix('.mp4')
    if new.exists():
        print(f"  rename: skipped ({new.name} already exists)")
        return p
    p.rename(new)
    print(f"  rename: {p.name} -> {new.name}")
    return new


def main() -> None:
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    p = Path(sys.argv[1])
    if not p.is_file():
        print(f"error: not a file: {p}")
        sys.exit(1)
    print(f"Processing: {p}")
    faststart(p)
    patch_brand(p)
    final = rename_to_mp4(p)
    if final != p:
        print(f"\nMarkdown update needed: '{p.name}' -> '{final.name}'")


if __name__ == '__main__':
    main()
