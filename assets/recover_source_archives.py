#!/usr/bin/env python3
"""Verify/recover preserved APP-004 source ZIP archives without overwriting files."""
from __future__ import annotations
import argparse
import hashlib
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent / "source-archive"
ARCHIVES = {
    "cats": {
        "dir": ROOT / "cats/hq-v5",
        "prefix": "cats-hq-v5.zip.part",
        "count": 4,
        "sha256": "8360b3598a2fef2d491ed1e6c7778b1d3e3de91b8dd14ffd5c4e78c3553d1a45",
        "size": 3584000,
    },
    "icons": {
        "dir": ROOT / "icons/qc-v4",
        "prefix": "icons-qc-v4-196.zip.part",
        "count": 17,
        "sha256": "f1b6c92264914de53b5755a0b356b1a4840b4c7492cd41869e3cb15cc37b24a2",
        "size": 35306466,
    },
}

def verify(archive: str, output: Path | None) -> None:
    spec = ARCHIVES[archive]
    files = [spec["dir"] / f'{spec["prefix"]}{n:03d}' for n in range(1, spec["count"]+1)]
    if any(not p.is_file() for p in files):
        raise FileNotFoundError(f'Missing {archive} parts: {[str(p) for p in files if not p.is_file()]}')
    h = hashlib.sha256()
    length = 0
    dest = None
    try:
        if output is not None:
            # 'xb' refuses to overwrite existing, possibly important user files.
            dest = output.open("xb")
        for part in files:
            with part.open("rb") as src:
                while chunk := src.read(1 << 20):
                    length += len(chunk)
                    h.update(chunk)
                    if dest:
                        dest.write(chunk)
    finally:
        if dest:
            dest.close()
    ok = length == spec["size"] and h.hexdigest() == spec["sha256"]
    print(f'{archive}: {length} bytes, SHA256 {h.hexdigest()}, valid={ok}')
    if not ok:
        if output is not None:
            output.unlink(missing_ok=True)
        raise ValueError(f'{archive} checksum mismatch')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", choices=ARCHIVES, default="cats")
    parser.add_argument("--output", type=Path, help="optional ZIP output, must not already exist")
    options = parser.parse_args()
    verify(options.archive, options.output)
