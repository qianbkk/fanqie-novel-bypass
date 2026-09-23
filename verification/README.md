# verification/

End-to-end verification artifacts for the fork. Each iteration that changes
crypto, recovery, or hardware interactions is captured here. Files are grouped
roughly by version; old debugging attempts are kept under `_archive/` so that
the directory stays useful without hiding how we got here.

## v0.1.4 (current release)

| File | Purpose |
| --- | --- |
| `V014-FULLCHAPTER-EVIDENCE.md` | Headline report: registerKey → decryptChapter → DOM injection on a real Edge process. Body text length, item_id list, importKey rejection count. |
| `v014-release-notes.md` | User-facing release notes that ship with the GitHub release. |
| `EDGE-V014-UPGRADE-CHECKLIST.md` | Step-by-step Edge upgrade + 5-min soak + chapter jump checklist (the script the user runs to confirm Goal). |
| `chrome-cdp-v014-fullchapter.py` | Chrome sandbox harness driving the user.js through `Page.navigate` + `Runtime.evaluate`, with full chapter body assertion. |
| `chrome-cdp-v014-fullchapter-output.log` | Captured stdout from the Chrome sandbox run. |
| `chrome-cdp-v014-e2e-output.log` | Captured stdout from the earlier crypto-only sanity run. |
| `edge-debug-v014-e2e.py` | Same harness targeting a real `msedge.exe --remote-debugging-port=9556` process (not a sandbox). |
| `edge-debug-v014-e2e-output.log` | Captured stdout from the real-Edge run (the strongest pre-user-acceptance signal). |
| `edge-debug-v014-multichapter.py` | Multi-chapter soak: jumps Ch100 / 190 / 500 / 981 to assert no BufferSource errors across the book. |
| `edge-debug-v014-multichapter-output.log` | Captured stdout from the multi-chapter run. |
| `e2e-multi.html` | Minimal `localhost` page used to fire mocked fetches without hitting the production snssdk endpoint. |
| `pool-autoreset-test.mjs` | Node.js unit test that fast-forwards time to verify `pool/index.ts` schedules / cancels / executes auto-recovery correctly. |

## Historical reports (kept for audit, not needed for current release)

- `V013-VERIFICATION.md`, `v013-release-notes.md` — v0.1.3 evidence (BufferSource
  fix on `crypto/registerkey.ts` + `crypto/content.ts` + explicit recovery
  trigger). v0.1.4 supersedes these.
- `V012-VERIFICATION.md`, `EDGE-V012-ACCEPTANCE.md`, `EDGE-SELF-TEST.md` —
  v0.1.2 device-pool auto-recovery evidence (5 min countdown + 24h throttle).
- `FINAL-VERIFICATION.md`, `E2E-SNSSDK-VERIFICATION.md` — cross-cutting
  summaries that point at the per-version files above.

## `_archive/`

Process artifacts from prior debugging rounds — PowerShell mouse_event attempts,
Edge popover screenshots, init-script chunks, the C# CDP eval stub, the local
HTTP server used to deliver init scripts, etc. Kept (not deleted) so that if a
later regression points back at one of these failure modes the raw material is
still on disk, but excluded from the working directory to keep this top level
navigable.

`_archive/` is intentionally committed so the history travels with the repo.