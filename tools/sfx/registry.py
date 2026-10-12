"""汇总所有声音规格。"""
import sounds_craft
import sounds_machine
import sounds_nature
import sounds_paper
import sounds_room
import sounds_weather

EXPECTED_COUNT = 34

ALL_SOUNDS = (sounds_weather.SOUNDS + sounds_machine.SOUNDS + sounds_room.SOUNDS
              + sounds_paper.SOUNDS + sounds_craft.SOUNDS + sounds_nature.SOUNDS)

assert len({s.name for s in ALL_SOUNDS}) == len(ALL_SOUNDS), "声音名称重复"
assert len(ALL_SOUNDS) == EXPECTED_COUNT, f"应有 {EXPECTED_COUNT} 个声音，实际 {len(ALL_SOUNDS)}"
