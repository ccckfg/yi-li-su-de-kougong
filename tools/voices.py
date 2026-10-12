"""Generate every dialogue / narration line (MiniMax speech-2.8-hd) into film/public/audio/vo/.

Casting (2026-10-12, first pass — user A/B pending):
  kid   嫌疑人童声   clever_boy  (faster, cheeky)
  int   审讯者       Reliable_Executive, lowered
  man   老先生(第五段) same voice as 审讯者 but softer/slower
  old   种子老人声   Humorous_Elder (northern accent), lowered + thicker
  gran  老太太       Kind-hearted_Elder, slow and light
"""
import json
import sys
import time
import wave
from pathlib import Path

import mm
from common import ROOT

OUT = ROOT / "film" / "public" / "audio" / "vo"

VOICES = {
    "kid": dict(voice_id="clever_boy", speed=1.45),
    "int": dict(voice_id="Chinese (Mandarin)_Reliable_Executive", speed=1.15, voice_modify={"pitch": -25, "timbre": -20}),
    "man": dict(voice_id="Chinese (Mandarin)_Reliable_Executive", speed=1.02, emotion="sad",
                voice_modify={"pitch": -28, "timbre": -20, "intensity": 30}),
    "old": dict(voice_id="Chinese (Mandarin)_Humorous_Elder", speed=1.2, voice_modify={"pitch": -15, "timbre": -25}),
    "gran": dict(voice_id="Chinese (Mandarin)_Kind-hearted_Elder", speed=0.95, vol=0.9, voice_modify={"intensity": 40}),
}

# id, role, text, extra kwargs
LINES = [
    ("v01_gran_a", "gran", "就剩这么些了……", {}),
    ("v01_gran_b", "gran", "你可得对它好点儿啊。", {}),

    ("v02_01_int", "int", "名字。", {}),
    ("v02_02_kid", "kid", "……没有。", {}),
    ("v02_03_int", "int", "没有？", {}),
    ("v02_04_kid", "kid", "老太太管我叫黄毛。", {}),
    ("v02_05_kid", "kid", "不是那种黄毛啊！我可老实了。", {"emotion": "surprised"}),
    ("v02_06_int", "int", "多大？", {}),
    ("v02_07_kid", "kid", "今年秋天刚生的。", {}),
    ("v02_08_int", "int", "这上头写着，你在她家住了四十多年。", {}),
    ("v02_09_kid", "kid", "那是我爸，我爷，我太爷……我们一家子都住那儿，一辈接一辈的。", {}),
    ("v02_10_kid", "kid", "哎哎哎，拿走拿走！", {"emotion": "fearful"}),
    ("v02_11_int", "int", "一杯水，你怕什么。", {}),
    ("v02_12_kid", "kid", "我沾水就得开口！开了口就收不回去了！", {"emotion": "fearful"}),
    ("v02_13_int", "int", "……家里还有什么亲戚？", {}),
    ("v02_14_kid", "kid", "有个远房的。路边上、墙根底下，到处都是，你肯定见过。", {}),
    ("v02_15_int", "int", "叫什么？", {}),
    ("v02_16_kid", "kid", "不告诉你。说出来丢人。", {}),
    ("v02_17_int", "int", "(sighs)有什么特长？", {}),
    ("v02_18_kid", "kid", "耐旱，不挑地，石头缝里都能活。还有……熬粥特别香。", {"emotion": "happy"}),
    ("v02_19_int", "int", "知道为什么带你来吗？", {}),
    ("v02_20_kid", "kid", "不知道……我又不值钱。", {"emotion": "sad"}),
    ("v02_21_int", "int", "最后一个问题。你到底多大了？", {}),
    ("v02_22_kid", "kid", "你是问我，还是问我们？", {}),
    ("v02_23_int", "int", "你们。", {}),
    ("v02_24_kid", "kid", "……一万年吧。差不多。", {"speed": 1.15}),
    ("v02_24_old", "old", "……一万年吧。差不多。", {"speed": 1.0}),

    ("v03_1", "old", "那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。", {}),
    ("v03_2", "old", "后来就住进罐子里了。这习惯，我们家留到了今天。", {}),
    ("v03_3", "old", "他们在骨头上刻我。刻得还挺像，熟透的谷子，都低着头。", {}),
    ("v03_4", "old", "有人写诗，说我是老天爷赏的。我也没好意思吭声。", {}),
    ("v03_5", "old", "贾思勰把怎么挑我写下来了：挑好穗子，割下来，挂高。后来的人照着做了一千多年。", {}),
    ("v03_6", "old", "这句你们都会背吧？背的时候，想过那一粒是打哪来的吗？", {}),
    ("v03_7", "old", "老宋写书，粮食放第一篇，珠宝放最后一篇。这人，我喜欢。", {}),
    ("v03_8", "old", "小米加步枪。那几年……我是真扛过事儿的。", {}),

    ("v04_old", "old", "……谁让你们查的。", {"speed": 1.05, "vol": 0.85}),

    ("v05_01_old", "old", "那你到底……带我来干啥？", {}),
    ("v05_02_man", "man", "(sighs)那老太太八十三了。儿子们早不种这个了。", {}),
    ("v05_03_man", "man", "哪天她不在了，坛子一收拾，你们就全没了。", {}),
    ("v05_04_man", "man", "抓你干啥。接你来的。", {"emotion": "calm"}),
    ("v05_05_old", "old", "后来隔壁袋子跟我说，这老头干这个快四十年了。黑龙江到海南，一家一家敲门，就为讨一把种子。", {}),
    ("v05_06_old", "old", "房梁换成了铁架子，肉眼换成了测序仪。弯腰那一下，一直没变。", {}),
    ("v05_07_old", "old", "都说好种子是老天爷赏的。我活了一万年，老天爷一回没见着。见着的，全是这样的人。", {}),
    ("v05_08_old", "old", "……行吧。", {"speed": 1.0}),
    ("v05_09_kid", "kid", "我招。", {}),
]


def wav_ms(p: Path) -> int:
    with wave.open(str(p)) as w:
        return int(w.getnframes() / w.getframerate() * 1000)


TAKES = ROOT / "assets" / "audio" / "vo_takes"


def choose(paths: list[Path]) -> Path:
    from vo_analyze import speech_span
    spans = [(p, speech_span(p)) for p in paths]
    spans = [(p, e - s) for p, (s, e, _) in spans]
    longest = max(d for _, d in spans)
    ok = [(p, d) for p, d in spans if d >= 0.8 * longest] or spans
    return min(ok, key=lambda t: t[1])[0]


def run_takes(n: int = 2, only: set[str] | None = None) -> None:
    import shutil
    OUT.mkdir(parents=True, exist_ok=True)
    meta_path = OUT / "vo_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
    for lid, role, text, extra in LINES:
        if only and lid not in only:
            continue
        kw = dict(VOICES[role])
        kw.update(extra)
        voice_id = kw.pop("voice_id")
        paths = []
        for t in range(n):
            p = TAKES / f"{lid}_t{t + 1}.wav"
            mm.tts(text, voice_id, p, shot=lid, note=f"role={role} take{t + 1}", **kw)
            paths.append(p)
            time.sleep(1.2)
        best = choose(paths)
        shutil.copy2(best, OUT / f"{lid}.wav")
        meta[lid] = {"role": role, "text": text, "ms": wav_ms(best), "file": f"audio/vo/{lid}.wav", "take": best.name}
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{lid:12s} {role:5s} takes={[wav_ms(p) for p in paths]} -> {best.name}")


def run(only: set[str] | None = None, force: bool = False) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    meta_path = OUT / "vo_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
    for lid, role, text, extra in LINES:
        if only and lid not in only:
            continue
        existing = OUT / f"{lid}.wav"
        if existing.exists() and not force and not only:
            meta.setdefault(lid, {"role": role, "text": text, "ms": wav_ms(existing), "file": f"audio/vo/{lid}.wav"})
            continue
        kw = dict(VOICES[role])
        kw.update(extra)
        voice_id = kw.pop("voice_id")
        out = OUT / f"{lid}.wav"
        info = mm.tts(text, voice_id, out, shot=lid, note=f"role={role}", **kw)
        meta[lid] = {"role": role, "text": text, "ms": info.get("audio_length"), "file": f"audio/vo/{lid}.wav"}
        print(f"{lid:12s} {role:5s} {info.get('audio_length'):>6} ms  {text}")
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
        time.sleep(1.5)
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--takes" in sys.argv:
        run_takes(2, set(args) or None)
    else:
        run(set(args) or None, force="--force" in sys.argv)
