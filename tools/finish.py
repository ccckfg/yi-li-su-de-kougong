"""Final finishing pass on the Remotion render: halation + filmic grain + gentle curve; loudness to -15 LUFS / -1.5 dBTP.

usage: python finish.py <raw.mp4> <out.mp4> [--nograin]
"""
import subprocess
import sys
from pathlib import Path


def finish(raw: Path, out: Path, grain: bool = True, crf: int = 18, height: int = 1080) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    vf = (
        "[0:v]format=gbrp,split=2[base][hi];"  # blend per-plane only makes sense in RGB
        # halation: only the brightest highlights, blurred and tinted red-orange, screened back on
        "[hi]curves=all='0/0 0.72/0 1/1',gblur=sigma=16,"
        "colorchannelmixer=rr=1.0:rg=0:rb=0:gr=0:gg=0.42:gb=0:br=0:bg=0:bb=0.2[h];"
        "[base][h]blend=all_mode=screen:all_opacity=0.16[c];"
        + ("[c]noise=alls=6:allf=t+u,format=yuv420p,eq=contrast=1.015:saturation=0.98" if grain else "[c]format=yuv420p")
        + (f",scale=-2:{height}:flags=lanczos" if height != 1080 else "") + "[v]"
    )
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-i", str(raw),
        "-filter_complex", vf, "-map", "[v]", "-map", "0:a?",
        "-af", "loudnorm=I=-15:TP=-1.5:LRA=11",
        "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-r", "24", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", str(out),
    ]
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    args = sys.argv
    crf = int(args[args.index("--crf") + 1]) if "--crf" in args else 18
    h = int(args[args.index("--height") + 1]) if "--height" in args else 1080
    finish(Path(args[1]), Path(args[2]), "--nograin" not in args, crf, h)
    print("finished ->", sys.argv[2])
