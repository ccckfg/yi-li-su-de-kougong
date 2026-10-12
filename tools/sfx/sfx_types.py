"""声音规格数据类。"""
from dataclasses import dataclass
from typing import Callable, Optional, Tuple

from sfx_config import FADE_OUT_LOOP_MS, FADE_OUT_MS


@dataclass(frozen=True)
class Sound:
    name: str
    dur: float
    desc: str
    build: Callable            # (rng, dur) -> ndarray，(n,) 或 (n, 2)
    stereo: bool = False
    loop: bool = False
    ambient: bool = False      # 环境声归一到 AMBIENT_PEAK_DB
    centroid: Optional[Tuple[float, float]] = None  # 预期频谱质心范围 (Hz)，仅作合理性检查

    @property
    def fade_out_ms(self) -> float:
        return FADE_OUT_LOOP_MS if self.loop else FADE_OUT_MS
