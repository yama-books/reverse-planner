# APP-004 Source Asset Archive

**Purpose:** source preservation only. This branch is not the deployed app. Assets here are candidates and do not imply final brand selection.

## Verified ZIPs

| Archive | Parts | Total bytes | Original SHA-256 | Original ZIP files |
| --- | ---: | ---: | --- | ---: |
| HQ-v5 selected 12 cats | `cats/hq-v5/cats-hq-v5.zip.part001` to `part004` | 3584000 | `8360b3598a2fef2d491ed1e6c7778b1d3e3de91b8dd14ffd5c4e78c3553d1a45` | 80 |
| QC-v4 196 icons + 12 source sheets | `icons/qc-v4/icons-qc-v4-196.zip.part001` to `part017` | 35306466 | `f1b6c92264914de53b5755a0b356b1a4840b4c7492cd41869e3cb15cc37b24a2` | 435 |
| Logo A comparison v1 | `brand/logo-A-v1/reverse_planner_logo_A_comparison_v1.zip` | 2012955 | `81ef4b68def47b0af5d181b80f358412608045564313147ef9d789034998a84d` | 17 |

**How to restore:** Check out this branch and run from repository root:

```bash
python assets/recover_source_archives.py --archive cats --output cats-hq-v5-restored.zip
python assets/recover_source_archives.py --archive icons --output icons-qc-v4-restored.zip
```

The utility refuses overwriting existing output files, validates combined SHA-256 against the user-uploaded originals, and removes any created output on mismatch. To only check the archive without writing ZIPs, omit `--output`.

Each ZIP was also independently checked with Python `zipfile.testzip()` in the session that collected it; no damaged entries were found.

**Source policy:** HQ-v5 cat images are a curated subset of 196 icon candidates. QC-v4 images contain unapproved crop/alpha candidates and should not be promoted as final UI assets without review. Hero cat logo source and A1/A2/A3, D references are archived under `brand/`, but logo selection is still separate from storage. Do not place archives in main, Pages assets, or automatic app downloads.
