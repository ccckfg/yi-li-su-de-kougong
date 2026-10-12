import argparse
import json
from pathlib import Path


def parse_args(description):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--config", required=True, help="path to config.json")
    parser.add_argument("names", nargs="*", help="still names; defaults to config.stills")
    args = parser.parse_args()

    config_path = Path(args.config).resolve()
    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    base = config_path.parent
    for key in ("stillsDir", "outputDir", "workDir"):
        cfg[key] = (base / cfg[key]).resolve()
    return cfg, args.names or cfg["stills"]
