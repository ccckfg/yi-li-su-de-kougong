"""全局配置：采样率、种子、路径、电平、淡入淡出与质检阈值。"""
from pathlib import Path

SR = 48_000
SEED = 20261012

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = PROJECT_ROOT / "film" / "public" / "audio" / "sfx"
MANIFEST_FILE = "sfx_manifest.json"

# 母带
PEAK_DB = -3.0
AMBIENT_PEAK_DB = -6.0
HP_HZ = 20.0
HP_ORDER = 4
FADE_IN_MS = 5.0
FADE_OUT_MS = 40.0          # 一次性音效默认淡出（允许范围 20-80 ms）
FADE_OUT_LOOP_MS = 20.0     # 循环素材取下限，缩小接缝处的凹陷
FADE_OUT_RANGE_MS = (20.0, 80.0)

# 质检
SILENT_RMS_DB = -60.0       # 低于此视为静音文件
DC_MAX = 1e-3               # 满量程比例
PEAK_TOL_DB = 0.05
ENV_FRAME_S = 0.01
ACTIVE_FLOOR_DB = -50.0     # 相对峰值，高于此视为"有声"
TAIL_WINDOW_MS = 150.0
TAIL_MAX_DB = -30.0         # 文件末尾（淡出前）相对峰值应已衰减到此以下
LONG_SILENCE_FRAC = 0.6     # 有声部分占比低于 1-此值 视为尾部过长
LONG_SILENCE_MIN_DUR = 1.0  # 更短的素材（点击类）静音占比天然偏高，不检查
SEAM_MAX = 8.0              # 循环接缝处的跳变 / 典型逐样本变化
