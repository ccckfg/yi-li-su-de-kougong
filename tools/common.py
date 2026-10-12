"""Shared helpers: .env loading, prompt log (required for submission), spend ledger."""
import csv
import datetime as _dt
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
LOG_JSONL = DOCS / "prompt_log.jsonl"
LEDGER = DOCS / "ledger.csv"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def load_env() -> dict:
    env = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    for k, v in env.items():
        os.environ.setdefault(k, v)
    return env


def now() -> str:
    return _dt.datetime.now().isoformat(timespec="seconds")


def log_prompt(shot: str, tool: str, model: str, prompt, params: dict | None = None,
               outputs: list | None = None, note: str = "") -> None:
    """Append one AI call to the prompt log (原始AI指令). Never log secrets."""
    DOCS.mkdir(parents=True, exist_ok=True)
    entry = {
        "time": now(), "shot": shot, "tool": tool, "model": model,
        "prompt": prompt, "params": params or {}, "outputs": [str(o) for o in (outputs or [])],
        "note": note,
    }
    with LOG_JSONL.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def ledger(item: str, provider: str, amount: float, currency: str, detail: str = "") -> None:
    DOCS.mkdir(parents=True, exist_ok=True)
    new = not LEDGER.exists()
    with LEDGER.open("a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["time", "provider", "item", "amount", "currency", "detail"])
        w.writerow([now(), provider, item, f"{amount:.4f}", currency, detail])


def spent(provider: str) -> float:
    if not LEDGER.exists():
        return 0.0
    total = 0.0
    with LEDGER.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["provider"] == provider:
                total += float(row["amount"])
    return total
