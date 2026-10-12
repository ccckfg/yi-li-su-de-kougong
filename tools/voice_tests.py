"""Voice casting tests: MiniMax candidates + ElevenLabs (OpenRouter) A/B. Output: assets/audio/voice_tests/"""
from pathlib import Path

import mm
import orx
from common import ROOT

OUT = ROOT / "assets" / "audio" / "voice_tests"

CHILD = "老太太管我叫黄毛。<#0.4#>不是那种黄毛啊！我可老实了。"
OLD = "那会儿我还是根野草，一熟就往地上掉。<#0.5#>有人专掐那些熟了还不掉的。"
INTERROGATOR = "名字。<#1.0#>这上头写着，你在她家住了四十多年。"
GRANNY = "就剩这么些了……<#0.8#>你可得对它好点儿啊。"
OLD_EN = "那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。"
INTER_EN = "名字。……这上头写着，你在她家住了四十多年。"

tests_mm = [
    ("child_cute_boy", CHILD, "cute_boy", dict(speed=1.08)),
    ("child_clever_boy", CHILD, "clever_boy", dict(speed=1.08)),
    ("old_humorous_elder", OLD, "Chinese (Mandarin)_Humorous_Elder", dict(speed=0.86, voice_modify={"pitch": -15, "timbre": -25})),
    ("old_humorous_elder_plain", OLD, "Chinese (Mandarin)_Humorous_Elder", dict(speed=0.88)),
    ("inter_reliable_exec", INTERROGATOR, "Chinese (Mandarin)_Reliable_Executive", dict(speed=0.92, voice_modify={"pitch": -25, "timbre": -20})),
    ("inter_male_announcer", INTERROGATOR, "Chinese (Mandarin)_Male_Announcer", dict(speed=0.92, voice_modify={"pitch": -20, "timbre": -15})),
    ("granny_kindhearted", GRANNY, "Chinese (Mandarin)_Kind-hearted_Elder", dict(speed=0.82, vol=0.9, voice_modify={"intensity": 40})),
]

tests_el = [
    ("el_old_bill", OLD_EN, "bill"),
    ("el_old_george", OLD_EN, "george"),
    ("el_inter_brian", INTER_EN, "brian"),
    ("el_inter_daniel", INTER_EN, "daniel"),
]

if __name__ == "__main__":
    for name, text, voice, kw in tests_mm:
        info = mm.tts(text, voice, OUT / f"{name}.wav", shot="voice_test", note=f"casting test {name}", **kw)
        print(name, "ms:", info.get("audio_length"), "chars:", info.get("usage_characters"))
    for name, text, voice in tests_el:
        try:
            orx.tts(text, voice, OUT / f"{name}.mp3", shot="voice_test", note=f"casting A/B {name}")
            print(name, "ok")
        except Exception as e:
            print(name, "FAILED", e)
