"""Generate a still with Codex CLI's built-in image tool (ChatGPT plan, no API spend).

Codex writes images to ~/.codex/generated_images/<session>/; its Windows exec sandbox is broken,
so we only let it call the image tool and collect the new files ourselves.

usage: python codex_img.py <shot> <out.png> <prompt-file-or-text> [--refs a.png,b.png]
"""
import argparse
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

from common import ROOT, log_prompt

GEN = Path.home() / ".codex" / "generated_images"
_EXE = Path("D:/MyApps/nodejs/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe")
CODEX = str(_EXE) if _EXE.exists() else (shutil.which("codex") or "codex")
SCRATCH = ROOT / "logs" / "codex"


def snapshot() -> set[Path]:
    return set(GEN.rglob("*.png")) if GEN.exists() else set()


def generate(shot: str, out: Path, prompt: str, refs: list[Path] | None = None, timeout: int = 600) -> list[Path]:
    out = Path(out).resolve()
    SCRATCH.mkdir(parents=True, exist_ok=True)
    before = snapshot()
    t0 = time.time()
    instruction = (
        "Call your built-in image generation tool exactly once to create the image described below. "
        "Do not run shell commands, do not write code, do not ask questions. "
        "Landscape 16:9, highest available resolution. After the tool returns, reply with just: DONE.\n\n"
        "IMAGE BRIEF:\n" + prompt
    )
    cmd = [CODEX, "exec", "--skip-git-repo-check", "-s", "read-only", "-C", str(SCRATCH),
           "-c", 'model_reasoning_effort="low"']
    for r in refs or []:
        cmd += ["-i", str(r)]
    log = SCRATCH / f"{shot}_{int(t0)}.log"
    with log.open("w", encoding="utf-8") as f:  # prompt goes through stdin: no shell quoting issues
        subprocess.run(cmd, stdout=f, stderr=subprocess.STDOUT, timeout=timeout,
                       shell=False, input=instruction.encode("utf-8"))
    # parallel runs share GEN; attribute images by this run's session id
    m = re.search(r"session id:\s*([0-9a-f-]{36})", log.read_text(encoding="utf-8", errors="ignore"))
    if m and (GEN / m.group(1)).exists():
        new = sorted((GEN / m.group(1)).glob("*.png"), key=lambda p: p.stat().st_mtime)
    else:
        new = sorted((p for p in snapshot() - before if p.stat().st_mtime >= t0 - 5), key=lambda p: p.stat().st_mtime)
    out.parent.mkdir(parents=True, exist_ok=True)
    outs = []
    for i, p in enumerate(new):
        dst = out if i == 0 else out.with_name(f"{out.stem}_alt{i}{out.suffix}")
        shutil.copy2(p, dst)
        outs.append(dst)
    log_prompt(shot, "Codex CLI image_generation", "codex (ChatGPT image tool)", prompt,
               {"refs": [str(r) for r in refs or []]}, [o.relative_to(ROOT) for o in outs],
               "" if outs else f"no image produced, see {log.relative_to(ROOT)}")
    return outs


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("shot")
    ap.add_argument("out")
    ap.add_argument("prompt")
    ap.add_argument("--refs", default="")
    a = ap.parse_args()
    pr = Path(a.prompt)
    text = pr.read_text(encoding="utf-8") if pr.suffix in (".txt", ".md") and pr.exists() else a.prompt
    refs = [Path(x) for x in a.refs.split(",") if x]
    res = generate(a.shot, Path(a.out), text, refs)
    print("\n".join(str(r) for r in res) if res else "NO IMAGE")
    sys.exit(0 if res else 1)
