"""Check depth outputs: exist, match still size, 16-bit, not flat black/white."""
import sys

import numpy as np
from PIL import Image

from common import parse_args


def check(name, cfg):
    problems = []
    still_path = cfg["stillsDir"] / (name + cfg["inputExt"])
    depth_path = cfg["outputDir"] / (name + cfg["depthSuffix"])
    preview_path = cfg["outputDir"] / (name + cfg["previewSuffix"])

    for p in (depth_path, preview_path):
        if not p.exists():
            problems.append(f"missing {p.name}")
    if problems:
        return problems

    with Image.open(still_path) as still, Image.open(depth_path) as depth:
        if depth.size != still.size:
            problems.append(f"size {depth.size} != still {still.size}")
        if depth.mode != "I;16":
            problems.append(f"mode {depth.mode}, expected I;16")
        arr = np.asarray(depth).astype(np.float64)

    lo, hi, mean = arr.min(), arr.max(), arr.mean()
    print(f"{name}: size={depth.size} min={lo:.0f} max={hi:.0f} mean={mean:.0f}")

    span = (hi - lo) / 65535
    mean_frac = mean / 65535
    if span < cfg["verify"]["minSpan"]:
        problems.append(f"dynamic range too small ({span:.2f})")
    low, high = cfg["verify"]["meanRange"]
    if not low <= mean_frac <= high:
        problems.append(f"mean {mean_frac:.2f} outside [{low}, {high}]")
    return problems


if __name__ == "__main__":
    cfg, names = parse_args(__doc__)
    failed = False
    for n in names:
        for problem in check(n, cfg):
            failed = True
            print(f"{n}: FAIL {problem}")
    sys.exit(1 if failed else 0)
