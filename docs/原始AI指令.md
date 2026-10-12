# 原始 AI 指令（提示词日志）

《一粒粟的口供》 · 自动汇总自制作过程中的每一次 AI 调用（时间、工具、模型、原始提示词、产出文件）。


## 代码生成部分（Claude 编写的程序直接渲染）

以下镜头不是由图像/视频模型生成，而是由 Claude（Anthropic，Claude Opus 5.5）根据我们的分镜与指令编写 Remotion + three.js / WebGL 程序实时渲染：

- S06–S14 审讯室：3D 场景（台灯、木桌、征集表、钢笔、牛皮纸袋、空椅子、水杯）、自定义景深着色器、墨点洇开着色器；S14 谷粒倾泻用 cannon-es 物理引擎模拟 260 粒带壳谷粒。
- S15、S20、S21、S22：在 AI 静帧上用着色器做炭笔线条抖动、壁画落雨与颜料剥落、木刻逐刀显影、黑白胶片划痕闪烁。
- S16 半坡彩陶罐（3D，程序绘制红底黑彩纹样）、S17 甲骨「禾」字长成谷子（甲骨文字形取自维基共享资源，公有领域）、S18 青铜云雷纹与竹简（3D）。
- S23–S25 化验：显微一镜到底着色器（谷粒→纵切面→糊粉层→细胞核→DNA）、环形进化树、屏幕光退成台灯。
- S34 水渗进土、S35 露白（3D 谷粒与胚根）。
- 全片字幕、展签、征集表手写字、片名、致敬卡、创作信息页、混音与调色均由程序完成。

给 Claude 的主要指令：参赛通知、剧本《口供》、分镜表与提示词（见附件原文），以及“以代码为主生成视频，AI 图像/视频模型只补充难以用代码实现的素材”的要求。

## 生成式模型调用明细

### voice_test

- **2026-10-12T01:28:18** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老太太管我叫黄毛。<#0.4#>不是那种黄毛啊！我可老实了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "cute_boy", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"}`
  产出：assets\audio\voice_tests\child_cute_boy.wav
  备注：casting test child_cute_boy

- **2026-10-12T01:28:21** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老太太管我叫黄毛。<#0.4#>不是那种黄毛啊！我可老实了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\voice_tests\child_clever_boy.wav
  备注：casting test child_clever_boy

- **2026-10-12T01:28:25** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那会儿我还是根野草，一熟就往地上掉。<#0.5#>有人专掐那些熟了还不掉的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.86, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：assets\audio\voice_tests\old_humorous_elder.wav
  备注：casting test old_humorous_elder

- **2026-10-12T01:28:29** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那会儿我还是根野草，一熟就往地上掉。<#0.5#>有人专掐那些熟了还不掉的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.88, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：assets\audio\voice_tests\old_humorous_elder_plain.wav
  备注：casting test old_humorous_elder_plain

- **2026-10-12T01:28:32** · MiniMax T2A · `speech-2.8-hd`

  ```text
  名字。<#1.0#>这上头写着，你在她家住了四十多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.92, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\voice_tests\inter_reliable_exec.wav
  备注：casting test inter_reliable_exec

- **2026-10-12T01:28:36** · MiniMax T2A · `speech-2.8-hd`

  ```text
  名字。<#1.0#>这上头写着，你在她家住了四十多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Male_Announcer", "speed": 0.92, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：assets\audio\voice_tests\inter_male_announcer.wav
  备注：casting test inter_male_announcer

- **2026-10-12T01:28:40** · MiniMax T2A · `speech-2.8-hd`

  ```text
  就剩这么些了……<#0.8#>你可得对它好点儿啊。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.82, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\voice_tests\granny_kindhearted.wav
  备注：casting test granny_kindhearted

- **2026-10-12T01:28:44** · OpenRouter TTS · `elevenlabs/eleven-v4`

  ```text
  那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。
  ```
  参数：`{"voice": "bill"}`
  产出：assets\audio\voice_tests\el_old_bill.mp3
  备注：casting A/B el_old_bill

- **2026-10-12T01:28:47** · OpenRouter TTS · `elevenlabs/eleven-v4`

  ```text
  那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。
  ```
  参数：`{"voice": "george"}`
  产出：assets\audio\voice_tests\el_old_george.mp3
  备注：casting A/B el_old_george

- **2026-10-12T01:28:50** · OpenRouter TTS · `elevenlabs/eleven-v4`

  ```text
  名字。……这上头写着，你在她家住了四十多年。
  ```
  参数：`{"voice": "brian"}`
  产出：assets\audio\voice_tests\el_inter_brian.mp3
  备注：casting A/B el_inter_brian

- **2026-10-12T01:28:53** · OpenRouter TTS · `elevenlabs/eleven-v4`

  ```text
  名字。……这上头写着，你在她家住了四十多年。
  ```
  参数：`{"voice": "daniel"}`
  产出：assets\audio\voice_tests\el_inter_daniel.mp3
  备注：casting A/B el_inter_daniel

### v01_gran_a

- **2026-10-12T01:30:12** · MiniMax T2A · `speech-2.8-hd`

  ```text
  就剩这么些了……
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.82, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v01_gran_a.wav
  备注：role=gran

- **2026-10-12T01:34:58** · MiniMax T2A · `speech-2.8-hd`

  ```text
  就剩这么些了……
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.88, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v01_gran_a.wav
  备注：role=gran

- **2026-10-12T01:46:21** · MiniMax T2A · `speech-2.8-hd`

  ```text
  就剩这么些了……
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.95, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v01_gran_a_t1.wav
  备注：role=gran take1

- **2026-10-12T01:46:26** · MiniMax T2A · `speech-2.8-hd`

  ```text
  就剩这么些了……
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.95, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v01_gran_a_t2.wav
  备注：role=gran take2

### v01_gran_b

- **2026-10-12T01:30:16** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你可得对它好点儿啊。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.82, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v01_gran_b.wav
  备注：role=gran

- **2026-10-12T01:35:03** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你可得对它好点儿啊。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.88, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v01_gran_b.wav
  备注：role=gran

- **2026-10-12T01:46:31** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你可得对它好点儿啊。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.95, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v01_gran_b_t1.wav
  备注：role=gran take1

- **2026-10-12T01:46:37** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你可得对它好点儿啊。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Kind-hearted_Elder", "speed": 0.95, "vol": 0.9, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v01_gran_b_t2.wav
  备注：role=gran take2

### v02_01_int

- **2026-10-12T01:30:19** · MiniMax T2A · `speech-2.8-hd`

  ```text
  名字。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_01_int.wav
  备注：role=int

- **2026-10-12T01:35:07** · MiniMax T2A · `speech-2.8-hd`

  ```text
  名字。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_01_int.wav
  备注：role=int

- **2026-10-12T01:46:41** · MiniMax T2A · `speech-2.8-hd`

  ```text
  名字。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_01_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:46:46** · MiniMax T2A · `speech-2.8-hd`

  ```text
  名字。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_01_int_t2.wav
  备注：role=int take2

### v02_02_kid

- **2026-10-12T01:30:22** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……没有。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_02_kid.wav
  备注：role=kid

- **2026-10-12T01:35:12** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……没有。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_02_kid.wav
  备注：role=kid

- **2026-10-12T01:46:50** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……没有。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_02_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:46:54** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……没有。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_02_kid_t2.wav
  备注：role=kid take2

### v02_03_int

- **2026-10-12T01:30:25** · MiniMax T2A · `speech-2.8-hd`

  ```text
  没有？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_03_int.wav
  备注：role=int

- **2026-10-12T01:35:16** · MiniMax T2A · `speech-2.8-hd`

  ```text
  没有？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_03_int.wav
  备注：role=int

- **2026-10-12T01:46:58** · MiniMax T2A · `speech-2.8-hd`

  ```text
  没有？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_03_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:47:02** · MiniMax T2A · `speech-2.8-hd`

  ```text
  没有？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_03_int_t2.wav
  备注：role=int take2

### v02_04_kid

- **2026-10-12T01:30:27** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老太太管我叫黄毛。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_04_kid.wav
  备注：role=kid

- **2026-10-12T01:35:20** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老太太管我叫黄毛。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_04_kid.wav
  备注：role=kid

- **2026-10-12T01:47:06** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老太太管我叫黄毛。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_04_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:47:10** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老太太管我叫黄毛。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_04_kid_t2.wav
  备注：role=kid take2

### v02_05_kid

- **2026-10-12T01:30:30** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不是那种黄毛啊！我可老实了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0, "emotion": "surprised"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v02_05_kid.wav
  备注：role=kid

- **2026-10-12T01:35:25** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不是那种黄毛啊！我可老实了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0, "emotion": "surprised"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true`
  产出：film\public\audio\vo\v02_05_kid.wav
  备注：role=kid

- **2026-10-12T01:47:15** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不是那种黄毛啊！我可老实了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "surprised"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true`
  产出：assets\audio\vo_takes\v02_05_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:47:19** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不是那种黄毛啊！我可老实了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "surprised"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true`
  产出：assets\audio\vo_takes\v02_05_kid_t2.wav
  备注：role=kid take2

### v02_06_int

- **2026-10-12T01:30:33** · MiniMax T2A · `speech-2.8-hd`

  ```text
  多大？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_06_int.wav
  备注：role=int

- **2026-10-12T01:35:29** · MiniMax T2A · `speech-2.8-hd`

  ```text
  多大？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_06_int.wav
  备注：role=int

- **2026-10-12T01:47:23** · MiniMax T2A · `speech-2.8-hd`

  ```text
  多大？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_06_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:47:27** · MiniMax T2A · `speech-2.8-hd`

  ```text
  多大？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_06_int_t2.wav
  备注：role=int take2

### v02_07_kid

- **2026-10-12T01:30:36** · MiniMax T2A · `speech-2.8-hd`

  ```text
  今年秋天刚生的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_07_kid.wav
  备注：role=kid

- **2026-10-12T01:35:34** · MiniMax T2A · `speech-2.8-hd`

  ```text
  今年秋天刚生的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_07_kid.wav
  备注：role=kid

- **2026-10-12T01:47:31** · MiniMax T2A · `speech-2.8-hd`

  ```text
  今年秋天刚生的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_07_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:47:35** · MiniMax T2A · `speech-2.8-hd`

  ```text
  今年秋天刚生的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_07_kid_t2.wav
  备注：role=kid take2

### v02_08_int

- **2026-10-12T01:30:40** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这上头写着，你在她家住了四十多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_08_int.wav
  备注：role=int

- **2026-10-12T01:35:39** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这上头写着，你在她家住了四十多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_08_int.wav
  备注：role=int

- **2026-10-12T01:47:40** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这上头写着，你在她家住了四十多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_08_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:47:45** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这上头写着，你在她家住了四十多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_08_int_t2.wav
  备注：role=int take2

### v02_09_kid

- **2026-10-12T01:30:43** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那是我爸，我爷，我太爷……我们一家子都住那儿，一辈接一辈的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_09_kid.wav
  备注：role=kid

- **2026-10-12T01:35:44** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那是我爸，我爷，我太爷……我们一家子都住那儿，一辈接一辈的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_09_kid.wav
  备注：role=kid

- **2026-10-12T01:47:50** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那是我爸，我爷，我太爷……我们一家子都住那儿，一辈接一辈的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_09_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:47:55** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那是我爸，我爷，我太爷……我们一家子都住那儿，一辈接一辈的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_09_kid_t2.wav
  备注：role=kid take2

### v02_10_kid

- **2026-10-12T01:30:46** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哎哎哎，拿走拿走！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "`
  产出：film\public\audio\vo\v02_10_kid.wav
  备注：role=kid

- **2026-10-12T01:35:48** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哎哎哎，拿走拿走！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v02_10_kid.wav
  备注：role=kid

- **2026-10-12T01:47:59** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哎哎哎，拿走拿走！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v02_10_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:48:03** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哎哎哎，拿走拿走！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v02_10_kid_t2.wav
  备注：role=kid take2

### v02_11_int

- **2026-10-12T01:30:49** · MiniMax T2A · `speech-2.8-hd`

  ```text
  一杯水，你怕什么。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_11_int.wav
  备注：role=int

- **2026-10-12T01:35:53** · MiniMax T2A · `speech-2.8-hd`

  ```text
  一杯水，你怕什么。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_11_int.wav
  备注：role=int

- **2026-10-12T01:48:07** · MiniMax T2A · `speech-2.8-hd`

  ```text
  一杯水，你怕什么。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_11_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:48:12** · MiniMax T2A · `speech-2.8-hd`

  ```text
  一杯水，你怕什么。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_11_int_t2.wav
  备注：role=int take2

### v02_12_kid

- **2026-10-12T01:30:52** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我沾水就得开口！开了口就收不回去了！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "`
  产出：film\public\audio\vo\v02_12_kid.wav
  备注：role=kid

- **2026-10-12T01:35:58** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我沾水就得开口！开了口就收不回去了！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v02_12_kid.wav
  备注：role=kid

- **2026-10-12T01:48:16** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我沾水就得开口！开了口就收不回去了！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v02_12_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:48:21** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我沾水就得开口！开了口就收不回去了！
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "fearful"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v02_12_kid_t2.wav
  备注：role=kid take2

### v02_13_int

- **2026-10-12T01:30:56** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……家里还有什么亲戚？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_13_int.wav
  备注：role=int

- **2026-10-12T01:36:02** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……家里还有什么亲戚？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_13_int.wav
  备注：role=int

- **2026-10-12T01:48:26** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……家里还有什么亲戚？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_13_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:48:30** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……家里还有什么亲戚？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_13_int_t2.wav
  备注：role=int take2

### v02_14_kid

- **2026-10-12T01:30:59** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有个远房的。路边上、墙根底下，到处都是，你肯定见过。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_14_kid.wav
  备注：role=kid

- **2026-10-12T01:36:07** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有个远房的。路边上、墙根底下，到处都是，你肯定见过。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_14_kid.wav
  备注：role=kid

- **2026-10-12T01:48:35** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有个远房的。路边上、墙根底下，到处都是，你肯定见过。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_14_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:48:39** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有个远房的。路边上、墙根底下，到处都是，你肯定见过。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_14_kid_t2.wav
  备注：role=kid take2

### v02_15_int

- **2026-10-12T01:31:02** · MiniMax T2A · `speech-2.8-hd`

  ```text
  叫什么？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_15_int.wav
  备注：role=int

- **2026-10-12T01:36:11** · MiniMax T2A · `speech-2.8-hd`

  ```text
  叫什么？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_15_int.wav
  备注：role=int

- **2026-10-12T01:48:43** · MiniMax T2A · `speech-2.8-hd`

  ```text
  叫什么？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_15_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:48:47** · MiniMax T2A · `speech-2.8-hd`

  ```text
  叫什么？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_15_int_t2.wav
  备注：role=int take2

### v02_16_kid

- **2026-10-12T01:31:05** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不告诉你。说出来丢人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_16_kid.wav
  备注：role=kid

- **2026-10-12T01:36:16** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不告诉你。说出来丢人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_16_kid.wav
  备注：role=kid

- **2026-10-12T01:48:52** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不告诉你。说出来丢人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_16_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:49:03** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不告诉你。说出来丢人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_16_kid_t2.wav
  备注：role=kid take2

### v02_17_int

- **2026-10-12T01:31:08** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)有什么特长？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_17_int.wav
  备注：role=int

- **2026-10-12T01:36:21** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)有什么特长？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_17_int.wav
  备注：role=int

- **2026-10-12T01:49:08** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)有什么特长？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_17_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:49:13** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)有什么特长？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_17_int_t2.wav
  备注：role=int take2

### v02_18_kid

- **2026-10-12T01:31:53** · MiniMax T2A · `speech-2.8-hd`

  ```text
  耐旱，不挑地，石头缝里都能活。还有……熬粥特别香。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0, "emotion": "happy"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "su`
  产出：film\public\audio\vo\v02_18_kid.wav
  备注：role=kid

- **2026-10-12T01:36:26** · MiniMax T2A · `speech-2.8-hd`

  ```text
  耐旱，不挑地，石头缝里都能活。还有……熬粥特别香。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0, "emotion": "happy"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "s`
  产出：film\public\audio\vo\v02_18_kid.wav
  备注：role=kid

- **2026-10-12T01:49:17** · MiniMax T2A · `speech-2.8-hd`

  ```text
  耐旱，不挑地，石头缝里都能活。还有……熬粥特别香。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "happy"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "s`
  产出：assets\audio\vo_takes\v02_18_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:49:22** · MiniMax T2A · `speech-2.8-hd`

  ```text
  耐旱，不挑地，石头缝里都能活。还有……熬粥特别香。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "happy"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "s`
  产出：assets\audio\vo_takes\v02_18_kid_t2.wav
  备注：role=kid take2

### v02_19_int

- **2026-10-12T01:31:58** · MiniMax T2A · `speech-2.8-hd`

  ```text
  知道为什么带你来吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_19_int.wav
  备注：role=int

- **2026-10-12T01:36:30** · MiniMax T2A · `speech-2.8-hd`

  ```text
  知道为什么带你来吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_19_int.wav
  备注：role=int

- **2026-10-12T01:49:34** · MiniMax T2A · `speech-2.8-hd`

  ```text
  知道为什么带你来吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_19_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:49:39** · MiniMax T2A · `speech-2.8-hd`

  ```text
  知道为什么带你来吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_19_int_t2.wav
  备注：role=int take2

### v02_20_kid

- **2026-10-12T01:32:03** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不知道……我又不值钱。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subt`
  产出：film\public\audio\vo\v02_20_kid.wav
  备注：role=kid

- **2026-10-12T01:36:35** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不知道……我又不值钱。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "sub`
  产出：film\public\audio\vo\v02_20_kid.wav
  备注：role=kid

- **2026-10-12T01:49:43** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不知道……我又不值钱。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "sub`
  产出：assets\audio\vo_takes\v02_20_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:49:47** · MiniMax T2A · `speech-2.8-hd`

  ```text
  不知道……我又不值钱。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "sub`
  产出：assets\audio\vo_takes\v02_20_kid_t2.wav
  备注：role=kid take2

### v02_21_int

- **2026-10-12T01:32:08** · MiniMax T2A · `speech-2.8-hd`

  ```text
  最后一个问题。你到底多大了？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_21_int.wav
  备注：role=int

- **2026-10-12T01:36:40** · MiniMax T2A · `speech-2.8-hd`

  ```text
  最后一个问题。你到底多大了？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_21_int.wav
  备注：role=int

- **2026-10-12T01:49:52** · MiniMax T2A · `speech-2.8-hd`

  ```text
  最后一个问题。你到底多大了？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_21_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:50:03** · MiniMax T2A · `speech-2.8-hd`

  ```text
  最后一个问题。你到底多大了？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_21_int_t2.wav
  备注：role=int take2

### v02_22_kid

- **2026-10-12T01:32:12** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你是问我，还是问我们？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v02_22_kid.wav
  备注：role=kid

- **2026-10-12T01:36:44** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你是问我，还是问我们？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_22_kid.wav
  备注：role=kid

- **2026-10-12T01:50:07** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你是问我，还是问我们？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_22_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:50:11** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你是问我，还是问我们？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_22_kid_t2.wav
  备注：role=kid take2

### v02_23_int

- **2026-10-12T01:32:17** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你们。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_23_int.wav
  备注：role=int

- **2026-10-12T01:36:49** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你们。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.08, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：film\public\audio\vo\v02_23_int.wav
  备注：role=int

- **2026-10-12T01:50:15** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你们。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_23_int_t1.wav
  备注：role=int take1

- **2026-10-12T01:50:27** · MiniMax T2A · `speech-2.8-hd`

  ```text
  你们。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": t`
  产出：assets\audio\vo_takes\v02_23_int_t2.wav
  备注：role=int take2

### v02_24_kid

- **2026-10-12T01:32:21** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 0.95, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_24_kid.wav
  备注：role=kid

- **2026-10-12T01:36:54** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.05, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v02_24_kid.wav
  备注：role=kid

- **2026-10-12T01:50:31** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_24_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:50:37** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.15, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v02_24_kid_t2.wav
  备注：role=kid take2

### v02_24_old

- **2026-10-12T01:32:26** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.85, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v02_24_old.wav
  备注：role=old

- **2026-10-12T01:36:59** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.92, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v02_24_old.wav
  备注：role=old

- **2026-10-12T01:50:41** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.0, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v02_24_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:50:46** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……一万年吧。差不多。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.0, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v02_24_old_t2.wav
  备注：role=old take2

### v03_1

- **2026-10-12T01:32:32** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_1.wav
  备注：role=old

- **2026-10-12T01:37:04** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_1.wav
  备注：role=old

- **2026-10-12T01:50:58** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_1_t1.wav
  备注：role=old take1

- **2026-10-12T01:51:03** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那会儿我还是根野草，一熟就往地上掉。有人专掐那些熟了还不掉的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_1_t2.wav
  备注：role=old take2

### v03_2

- **2026-10-12T01:32:38** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来就住进罐子里了。这习惯，我们家留到了今天。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_2.wav
  备注：role=old

- **2026-10-12T01:37:09** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来就住进罐子里了。这习惯，我们家留到了今天。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_2.wav
  备注：role=old

- **2026-10-12T01:51:08** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来就住进罐子里了。这习惯，我们家留到了今天。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_2_t1.wav
  备注：role=old take1

- **2026-10-12T01:51:14** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来就住进罐子里了。这习惯，我们家留到了今天。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_2_t2.wav
  备注：role=old take2

### v03_3

- **2026-10-12T01:32:43** · MiniMax T2A · `speech-2.8-hd`

  ```text
  他们在骨头上刻我。刻得还挺像，熟透的谷子，都低着头。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_3.wav
  备注：role=old

- **2026-10-12T01:37:15** · MiniMax T2A · `speech-2.8-hd`

  ```text
  他们在骨头上刻我。刻得还挺像，熟透的谷子，都低着头。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_3.wav
  备注：role=old

- **2026-10-12T01:51:19** · MiniMax T2A · `speech-2.8-hd`

  ```text
  他们在骨头上刻我。刻得还挺像，熟透的谷子，都低着头。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_3_t1.wav
  备注：role=old take1

- **2026-10-12T01:51:24** · MiniMax T2A · `speech-2.8-hd`

  ```text
  他们在骨头上刻我。刻得还挺像，熟透的谷子，都低着头。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_3_t2.wav
  备注：role=old take2

### v03_4

- **2026-10-12T01:32:49** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有人写诗，说我是老天爷赏的。我也没好意思吭声。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_4.wav
  备注：role=old

- **2026-10-12T01:37:21** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有人写诗，说我是老天爷赏的。我也没好意思吭声。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_4.wav
  备注：role=old

- **2026-10-12T01:51:28** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有人写诗，说我是老天爷赏的。我也没好意思吭声。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_4_t1.wav
  备注：role=old take1

- **2026-10-12T01:51:40** · MiniMax T2A · `speech-2.8-hd`

  ```text
  有人写诗，说我是老天爷赏的。我也没好意思吭声。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_4_t2.wav
  备注：role=old take2

### v03_5

- **2026-10-12T01:32:55** · MiniMax T2A · `speech-2.8-hd`

  ```text
  贾思勰把怎么挑我写下来了：挑好穗子，割下来，挂高。后来的人照着做了一千多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_5.wav
  备注：role=old

- **2026-10-12T01:37:27** · MiniMax T2A · `speech-2.8-hd`

  ```text
  贾思勰把怎么挑我写下来了：挑好穗子，割下来，挂高。后来的人照着做了一千多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_5.wav
  备注：role=old

- **2026-10-12T01:51:46** · MiniMax T2A · `speech-2.8-hd`

  ```text
  贾思勰把怎么挑我写下来了：挑好穗子，割下来，挂高。后来的人照着做了一千多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_5_t1.wav
  备注：role=old take1

- **2026-10-12T01:51:52** · MiniMax T2A · `speech-2.8-hd`

  ```text
  贾思勰把怎么挑我写下来了：挑好穗子，割下来，挂高。后来的人照着做了一千多年。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_5_t2.wav
  备注：role=old take2

### v03_6

- **2026-10-12T01:33:01** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这句你们都会背吧？背的时候，想过那一粒是打哪来的吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_6.wav
  备注：role=old

- **2026-10-12T01:37:32** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这句你们都会背吧？背的时候，想过那一粒是打哪来的吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_6.wav
  备注：role=old

- **2026-10-12T01:51:57** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这句你们都会背吧？背的时候，想过那一粒是打哪来的吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_6_t1.wav
  备注：role=old take1

- **2026-10-12T01:52:02** · MiniMax T2A · `speech-2.8-hd`

  ```text
  这句你们都会背吧？背的时候，想过那一粒是打哪来的吗？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_6_t2.wav
  备注：role=old take2

### v03_7

- **2026-10-12T01:33:07** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老宋写书，粮食放第一篇，珠宝放最后一篇。这人，我喜欢。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_7.wav
  备注：role=old

- **2026-10-12T01:37:38** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老宋写书，粮食放第一篇，珠宝放最后一篇。这人，我喜欢。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_7.wav
  备注：role=old

- **2026-10-12T01:52:07** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老宋写书，粮食放第一篇，珠宝放最后一篇。这人，我喜欢。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_7_t1.wav
  备注：role=old take1

- **2026-10-12T01:52:12** · MiniMax T2A · `speech-2.8-hd`

  ```text
  老宋写书，粮食放第一篇，珠宝放最后一篇。这人，我喜欢。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_7_t2.wav
  备注：role=old take2

### v03_8

- **2026-10-12T01:33:12** · MiniMax T2A · `speech-2.8-hd`

  ```text
  小米加步枪。那几年……我是真扛过事儿的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v03_8.wav
  备注：role=old

- **2026-10-12T01:37:43** · MiniMax T2A · `speech-2.8-hd`

  ```text
  小米加步枪。那几年……我是真扛过事儿的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v03_8.wav
  备注：role=old

- **2026-10-12T01:52:17** · MiniMax T2A · `speech-2.8-hd`

  ```text
  小米加步枪。那几年……我是真扛过事儿的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_8_t1.wav
  备注：role=old take1

- **2026-10-12T01:52:22** · MiniMax T2A · `speech-2.8-hd`

  ```text
  小米加步枪。那几年……我是真扛过事儿的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v03_8_t2.wav
  备注：role=old take2

### v04_old

- **2026-10-12T01:33:17** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……谁让你们查的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.9, "vol": 0.85, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v04_old.wav
  备注：role=old

- **2026-10-12T01:37:48** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……谁让你们查的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.0, "vol": 0.85, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v04_old.wav
  备注：role=old

- **2026-10-12T01:52:33** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……谁让你们查的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.05, "vol": 0.85, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true`
  产出：assets\audio\vo_takes\v04_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:52:38** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……谁让你们查的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.05, "vol": 0.85, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true`
  产出：assets\audio\vo_takes\v04_old_t2.wav
  备注：role=old take2

### v05_01_old

- **2026-10-12T01:33:22** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那你到底……带我来干啥？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v05_01_old.wav
  备注：role=old

- **2026-10-12T01:37:52** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那你到底……带我来干啥？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v05_01_old.wav
  备注：role=old

- **2026-10-12T01:52:42** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那你到底……带我来干啥？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_01_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:52:47** · MiniMax T2A · `speech-2.8-hd`

  ```text
  那你到底……带我来干啥？
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_01_old_t2.wav
  备注：role=old take2

### v05_02_man

- **2026-10-12T01:33:27** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)那老太太八十三了。儿子们早不种这个了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.86, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：film\public\audio\vo\v05_02_man.wav
  备注：role=man

- **2026-10-12T01:37:58** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)那老太太八十三了。儿子们早不种这个了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：film\public\audio\vo\v05_02_man.wav
  备注：role=man

- **2026-10-12T01:53:00** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)那老太太八十三了。儿子们早不种这个了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.02, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：assets\audio\vo_takes\v05_02_man_t1.wav
  备注：role=man take1

- **2026-10-12T01:53:05** · MiniMax T2A · `speech-2.8-hd`

  ```text
  (sighs)那老太太八十三了。儿子们早不种这个了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.02, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：assets\audio\vo_takes\v05_02_man_t2.wav
  备注：role=man take2

### v05_03_man

- **2026-10-12T01:33:33** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哪天她不在了，坛子一收拾，你们就全没了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.86, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：film\public\audio\vo\v05_03_man.wav
  备注：role=man

- **2026-10-12T01:38:04** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哪天她不在了，坛子一收拾，你们就全没了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：film\public\audio\vo\v05_03_man.wav
  备注：role=man

- **2026-10-12T01:53:10** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哪天她不在了，坛子一收拾，你们就全没了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.02, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：assets\audio\vo_takes\v05_03_man_t1.wav
  备注：role=man take1

- **2026-10-12T01:53:16** · MiniMax T2A · `speech-2.8-hd`

  ```text
  哪天她不在了，坛子一收拾，你们就全没了。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.02, "vol": 1.0, "pitch": 0, "emotion": "sad"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "s`
  产出：assets\audio\vo_takes\v05_03_man_t2.wav
  备注：role=man take2

### v05_04_man

- **2026-10-12T01:33:39** · MiniMax T2A · `speech-2.8-hd`

  ```text
  抓你干啥。接你来的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.86, "vol": 1.0, "pitch": 0, "emotion": "calm"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "`
  产出：film\public\audio\vo\v05_04_man.wav
  备注：role=man

- **2026-10-12T01:38:09** · MiniMax T2A · `speech-2.8-hd`

  ```text
  抓你干啥。接你来的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 0.95, "vol": 1.0, "pitch": 0, "emotion": "calm"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "`
  产出：film\public\audio\vo\v05_04_man.wav
  备注：role=man

- **2026-10-12T01:53:20** · MiniMax T2A · `speech-2.8-hd`

  ```text
  抓你干啥。接你来的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.02, "vol": 1.0, "pitch": 0, "emotion": "calm"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "`
  产出：assets\audio\vo_takes\v05_04_man_t1.wav
  备注：role=man take1

- **2026-10-12T01:53:25** · MiniMax T2A · `speech-2.8-hd`

  ```text
  抓你干啥。接你来的。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Reliable_Executive", "speed": 1.02, "vol": 1.0, "pitch": 0, "emotion": "calm"}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "`
  产出：assets\audio\vo_takes\v05_04_man_t2.wav
  备注：role=man take2

### v05_05_old

- **2026-10-12T01:33:46** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来隔壁袋子跟我说，这老头干这个快四十年了。黑龙江到海南，一家一家敲门，就为讨一把种子。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v05_05_old.wav
  备注：role=old

- **2026-10-12T01:38:16** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来隔壁袋子跟我说，这老头干这个快四十年了。黑龙江到海南，一家一家敲门，就为讨一把种子。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v05_05_old.wav
  备注：role=old

- **2026-10-12T01:53:30** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来隔壁袋子跟我说，这老头干这个快四十年了。黑龙江到海南，一家一家敲门，就为讨一把种子。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_05_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:53:36** · MiniMax T2A · `speech-2.8-hd`

  ```text
  后来隔壁袋子跟我说，这老头干这个快四十年了。黑龙江到海南，一家一家敲门，就为讨一把种子。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_05_old_t2.wav
  备注：role=old take2

### v05_06_old

- **2026-10-12T01:33:52** · MiniMax T2A · `speech-2.8-hd`

  ```text
  房梁换成了铁架子，肉眼换成了测序仪。弯腰那一下，一直没变。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v05_06_old.wav
  备注：role=old

- **2026-10-12T01:38:22** · MiniMax T2A · `speech-2.8-hd`

  ```text
  房梁换成了铁架子，肉眼换成了测序仪。弯腰那一下，一直没变。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v05_06_old.wav
  备注：role=old

- **2026-10-12T01:53:41** · MiniMax T2A · `speech-2.8-hd`

  ```text
  房梁换成了铁架子，肉眼换成了测序仪。弯腰那一下，一直没变。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_06_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:53:53** · MiniMax T2A · `speech-2.8-hd`

  ```text
  房梁换成了铁架子，肉眼换成了测序仪。弯腰那一下，一直没变。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_06_old_t2.wav
  备注：role=old take2

### v05_07_old

- **2026-10-12T01:33:57** · MiniMax T2A · `speech-2.8-hd`

  ```text
  都说好种子是老天爷赏的。我活了一万年，老天爷一回没见着。见着的，全是这样的人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.98, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v05_07_old.wav
  备注：role=old

- **2026-10-12T01:38:28** · MiniMax T2A · `speech-2.8-hd`

  ```text
  都说好种子是老天爷赏的。我活了一万年，老天爷一回没见着。见着的，全是这样的人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：film\public\audio\vo\v05_07_old.wav
  备注：role=old

- **2026-10-12T01:53:59** · MiniMax T2A · `speech-2.8-hd`

  ```text
  都说好种子是老天爷赏的。我活了一万年，老天爷一回没见着。见着的，全是这样的人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_07_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:54:04** · MiniMax T2A · `speech-2.8-hd`

  ```text
  都说好种子是老天爷赏的。我活了一万年，老天爷一回没见着。见着的，全是这样的人。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.2, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_07_old_t2.wav
  备注：role=old take2

### v05_08_old

- **2026-10-12T01:34:02** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……行吧。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.85, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v05_08_old.wav
  备注：role=old

- **2026-10-12T01:38:32** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……行吧。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 0.92, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true,`
  产出：film\public\audio\vo\v05_08_old.wav
  备注：role=old

- **2026-10-12T01:54:09** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……行吧。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.0, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_08_old_t1.wav
  备注：role=old take1

- **2026-10-12T01:54:13** · MiniMax T2A · `speech-2.8-hd`

  ```text
  ……行吧。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "Chinese (Mandarin)_Humorous_Elder", "speed": 1.0, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, `
  产出：assets\audio\vo_takes\v05_08_old_t2.wav
  备注：role=old take2

### v05_09_kid

- **2026-10-12T01:34:06** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我招。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.1, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word"`
  产出：film\public\audio\vo\v05_09_kid.wav
  备注：role=kid

- **2026-10-12T01:38:36** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我招。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.32, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：film\public\audio\vo\v05_09_kid.wav
  备注：role=kid

- **2026-10-12T01:54:17** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我招。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v05_09_kid_t1.wav
  备注：role=kid take1

- **2026-10-12T01:54:28** · MiniMax T2A · `speech-2.8-hd`

  ```text
  我招。
  ```
  参数：`{"model": "speech-2.8-hd", "stream": false, "voice_setting": {"voice_id": "clever_boy", "speed": 1.45, "vol": 1.0, "pitch": 0}, "audio_setting": {"sample_rate": 44100, "format": "wav", "channel": 1}, "language_boost": "Chinese", "output_format": "hex", "subtitle_enable": true, "subtitle_type": "word`
  产出：assets\audio\vo_takes\v05_09_kid_t2.wav
  备注：role=kid take2

### S04

- **2026-10-12T01:43:08** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up of an old man's hands with age spots and thick knuckles, cuffs of a worn grey wool sweater, an old stainless-steel-band mechanical wristwatch on the LEFT wrist, holding an old kraft-paper envelope, top folded over twice, faint illegible pencil marks on it open with its mouth facing up, as if about to receive something poured into it. Background: a softly blurred farmhouse kang with a patterned quilt, warm dim interior light, cold window light rim on the knuckles.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  产出：assets/stills/v1/S04.png
  备注：test run

- **2026-10-12T01:59:33** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up of an old man's hands with age spots and thick knuckles, cuffs of a worn grey wool sweater, an old stainless-steel-band mechanical wristwatch on the LEFT wrist, holding open a kraft-paper seed envelope whose mouth gapes open upward like a small paper bag; the bottom of the envelope already bulges slightly as if a little grain is inside, ready to receive more grain poured from above (the pouring itself is not shown, nothing falling in frame). Background: a softly blurred farmhouse kang with a patterned quilt, warm dim interior light, cold window light rim on the knuckles.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v2\S04.png

- **2026-10-12T02:00:08** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up of an old man's hands with age spots and thick knuckles, cuffs of a worn grey wool sweater, an old stainless-steel-band mechanical wristwatch on the LEFT wrist, holding open a kraft-paper seed envelope whose mouth gapes open upward like a small paper bag; the bottom of the envelope already bulges slightly as if a little grain is inside, ready to receive more grain poured from above (the pouring itself is not shown, nothing falling in frame). Background: a softly blurred farmhouse kang with a patterned quilt, warm dim interior light, cold window light rim on the knuckles.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v2\S04.png

- **2026-10-12T02:01:32** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定，浅景深。老人双手撑开牛皮纸袋的袋口，袋子随着上方有谷粒被倒进来而轻轻下沉、慢慢鼓起，纸袋表面发出细小的褶皱，双手微微用力稳住。画面中看不到倒进来的东西，不出现人脸，动作缓慢自然，手指数量正确。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v2\\S04.png", "last_frame": null, "task_id": "451331151278363"}`
  备注：round v1

### S09

- **2026-10-12T01:44:52** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up from above at a slight angle: an old man's hands with age spots and thick knuckles, cuffs of a worn grey wool sweater, an old stainless-steel-band mechanical wristwatch on the LEFT wrist turning over a stack of yellowed printed form sheets on an old scratched wooden desk, under the light of an old brass banker's desk lamp with a green glass shade from upper side. The printed table header is completely out of focus and unreadable. A fountain pen lies nearby.
  
  Style: Black-and-amber film noir still, lit only by one old desk lamp: a warm tungsten pool of light on the desk falling off into deep black, high contrast, shallow depth of field, 35mm film grain, photorealistic. No text, no letters, no watermark. No visible face.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S09.png

- **2026-10-12T01:57:55** · MiniMax video · `MiniMax-H3`

  ```text
  镜头几乎静止，极缓慢地推近。老人的手指捻起最上面一页泛黄的表格纸，慢慢翻过去，纸页的影子从手背上掠过，台灯的光稳定温暖。表头文字始终虚焦看不清。动作缓慢自然，手指数量正确，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 6, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S09.png", "last_frame": null, "task_id": "451332038017412"}`
  备注：round v1

### S02

- **2026-10-12T01:44:57** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Extreme wide shot at blue-grey dusk in heavy snowfall: a small village on the Loess Plateau of northern Shanxi, China — rammed-earth houses and cave dwellings (yaodong) cut into terraced loess slopes, thin snow on the ridges, a thread of smoke from one chimney. One small window glows warm yellow. In the lower middle of the frame, very small, the back of a person with an old canvas shoulder bag stands before a weathered wooden courtyard gate. Vast muted sky, painterly stillness.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S02.png

### S03

- **2026-10-12T01:44:58** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up inside a dim northern Chinese farmhouse, the corner of a heated brick kang bed covered with an old felt mat. On it sits a dark-brown coarse stoneware jar, its mouth covered by an upside-down white bowl with a blue rim. an old peasant woman's hands with cracked weathered skin, cuffs of a dark-blue coarse cotton padded jacket rests on top of the upturned bowl, about to lift it. Cold blue window light from the left mixes with a warm glow from inside the room. Dust in the air, textures of clay, cotton and enamel.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S03.png

- **2026-10-12T01:57:40** · MiniMax video · `MiniMax-H3`

  ```text
  镜头极缓慢地推近。老妇人的手轻轻把倒扣在坛口上的白瓷碗掀起，掀到半空停住，不再动；坛口露出里面的黑暗。窗外冷光轻轻闪动，空气中有细小灰尘缓缓漂浮。动作缓慢、克制、自然，手部结构正确，不出现人脸，不出现文字。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S03.png", "last_frame": null, "task_id": "451331512312199"}`
  备注：round v1 (single test)

### S29a

- **2026-10-12T01:46:14** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Medium shot from behind and to the side: a white-haired old man in a worn grey wool sweater sits at an old wooden desk under an old brass banker's desk lamp with a green glass shade; his face is turned away and lost in shadow — only his grey-white hair, ear and shoulder are rim-lit. One hand rests gently on an old kraft-paper envelope, top folded over twice, faint illegible pencil marks on it on the desk. Behind him, in the darkness, faint grey steel shelves full of small kraft envelopes.
  
  Style: Black-and-amber film noir still, lit only by one old desk lamp: a warm tungsten pool of light on the desk falling off into deep black, high contrast, shallow depth of field, 35mm film grain, photorealistic. No text, no letters, no watermark. No visible face.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S29a.png

- **2026-10-12T01:58:06** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定。老人坐在台灯前，背对镜头，一只手轻轻按在桌上的牛皮纸袋上，手指在纸袋上缓缓摩挲了一下；呼吸带动肩膀微微起伏。他的脸始终隐在阴影里，不转头，不出现人脸。台灯光线有极轻微的闪烁。
  ```
  参数：`{"resolution": "768P", "duration": 6, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S29a.png", "last_frame": null, "task_id": "451331334320528"}`
  备注：round v1

### S19

- **2026-10-12T01:46:20** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Traditional Chinese ink-wash painting (shuimo) on textured raw xuan paper, pale diluted ink, large empty areas of paper. Low-angle composition: from the bottom edge of the picture, two hands of an ancient Chinese farmer in loose robe sleeves raise a full drooping bunch of foxtail millet heads toward a horizontal wooden pole under a thatched eave in the upper third of the frame; several bunches of millet already hang from the pole, heads drooping. Elegant brushwork, soft ink bleeding, a few touches of pale ochre. 16:9. No text, no seal, no signature.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S19.png

- **2026-10-12T01:57:59** · MiniMax video · `MiniMax-H3`

  ```text
  保持中国水墨画风格的动画，宣纸质感始终不变，不要变成写实照片。淡墨笔触缓缓晕开显影；画面下方的一双古人的手把一束饱满低垂的谷穗慢慢举高，挂到屋檐下的木杆上，挂好后双手松开退出画面，谷穗轻轻晃动；墨色在纸上缓慢流动。镜头固定。
  ```
  参数：`{"resolution": "768P", "duration": 8, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S19.png", "last_frame": null, "task_id": "451328786399517"}`
  备注：round v1

### S26

- **2026-10-12T01:46:34** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up under an old brass banker's desk lamp with a green glass shade: an old man's hands with age spots and thick knuckles, cuffs of a worn grey wool sweater, an old stainless-steel-band mechanical wristwatch on the LEFT wrist taking off a pair of old reading glasses with thin metal frames, holding them by the temples, above an old wooden desk with a manila file folder and an old kraft-paper envelope, top folded over twice, faint illegible pencil marks on it. Warm amber light, shallow focus on the glasses and fingers, deep shadows.
  
  Style: Black-and-amber film noir still, lit only by one old desk lamp: a warm tungsten pool of light on the desk falling off into deep black, high contrast, shallow depth of field, 35mm film grain, photorealistic. No text, no letters, no watermark. No visible face.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S26.png

- **2026-10-12T01:58:03** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定，浅景深。老人的双手把老花镜慢慢摘下、合上镜腿折好，轻轻放在桌上的档案夹上。台灯暖光稳定，动作缓慢沉静，手指数量正确，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S26.png", "last_frame": null, "task_id": "451330020974878"}`
  备注：round v1

### S30-2

- **2026-10-12T01:47:40** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  1990s Chinese colour film photograph look (slightly faded, soft grain): a middle-aged man with black hair, wearing a grey wool sweater, crouches on the ridge at the edge of a field of ripe foxtail millet, seen from behind and to the side so his face is not visible; he writes in a small notebook resting on his knee; an old stainless-steel-band wristwatch on his left wrist; golden drooping millet heads sway around him; overcast soft daylight. No text.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S30-2.png

### S29b

- **2026-10-12T01:47:47** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Medium shot from behind: a white-haired old man in a worn grey wool sweater stands still at a small window of an old seed storage room at night, head slightly bowed. Outside the window it is snowing in blue darkness; the glass has a thin film of condensation. Warm lamp light inside, steel shelves with kraft envelopes at the edge of frame.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S29b.png

- **2026-10-12T01:58:10** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定。窗外夜色里雪花缓慢飘落，窗玻璃上有一层薄雾。老人背对镜头站在窗前一动不动，微微低头，呼吸让肩膀轻轻起伏。不转身，不出现人脸。室内暖光稳定。
  ```
  参数：`{"resolution": "768P", "duration": 8, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S29b.png", "last_frame": null, "task_id": "451328019296695"}`
  备注：round v1

### S30-1

- **2026-10-12T01:48:01** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  1980s Chinese colour film photograph look (faded Kodak/Fuji stock, warm yellow-green cast, soft grain): on a rutted loess dirt road between dry fields, a young man in a 1980s work jacket rides an old 28-inch black bicycle away from the camera, seen from behind; a canvas bag hangs from the handlebar and a bundle of kraft paper envelopes is tied on the rear rack; dust kicked up behind the wheels; wide open plateau, low sun. No text, no face visible.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S30-1.png

### S31-1

- **2026-10-12T01:49:00** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Inside an old Chinese farmhouse, low-angle shot looking up: an old peasant woman's hands with cracked weathered skin, cuffs of a dark-blue coarse cotton padded jacket lift a bunch of golden drooping foxtail millet heads from the bottom edge of the frame toward a dark wooden roof beam in the upper third of the frame, where several bunches of millet already hang head-down. Warm window light, dust in the air.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S31-1.png

### S30-3

- **2026-10-12T01:49:03** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Modern crisp digital photograph, exactly the same composition as a classic field-notes photo: a white-haired old man in a worn grey wool sweater crouches on the ridge at the edge of a field of ripe foxtail millet, seen from behind and to the side so his face is not visible; he writes in a small notebook resting on his knee; an old stainless-steel-band wristwatch on his left wrist; golden drooping millet heads around him; soft daylight, natural colours. No text.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S30-3.png

- **2026-10-12T01:59:59** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Edit the attached photograph. Keep EXACTLY the same composition, camera angle, framing, millet field, ridge, background and the same crouching pose and notebook. Change only two things: (1) the man becomes a white-haired elderly man of about 65, same build, same worn grey wool sweater, same old stainless-steel-band wristwatch on his left wrist, face still not visible; (2) the image look changes from 1990s film to a crisp modern digital photograph with natural colours and fine detail. No text.
  ```
  参数：`{"refs": ["D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S30-2.png"]}`
  产出：assets\stills\v2\S30-3.png

- **2026-10-12T02:00:23** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Edit the attached photograph. Keep EXACTLY the same composition, camera angle, framing, millet field, ridge, background and the same crouching pose and notebook. Change only two things: (1) the man becomes a white-haired elderly man of about 65, same build, same worn grey wool sweater, same old stainless-steel-band wristwatch on his left wrist, face still not visible; (2) the image look changes from 1990s film to a crisp modern digital photograph with natural colours and fine detail. No text.
  ```
  参数：`{"refs": ["D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S30-2.png"]}`
  产出：assets\stills\v2\S30-3.png

### S31-3

- **2026-10-12T01:49:27** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Inside an agricultural research station, low-angle shot looking up, same composition as a hanging-harvest photo: an old man's hands with age spots and thick knuckles, cuffs of a worn grey wool sweater, an old stainless-steel-band mechanical wristwatch on the LEFT wrist lift a bunch of golden drooping foxtail millet heads from the bottom edge of the frame toward a horizontal galvanized metal drying rack bar in the upper third of the frame, where rows of millet heads already hang. Soft cool daylight from high windows.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S31-3.png

### S15

- **2026-10-12T01:50:11** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Rough charcoal drawing on a coarse stone-like grey paper surface, heavy grain, only charcoal black and earthy yellow-ochre: around ten thousand years ago on a hillside in North China, a few hunter-gatherers wrapped in animal hides bend among tall wild grasses whose long slender seed heads droop; one of them pinches off a seed head that still clings to its stalk and drops it into a hide pouch. Expressive smudged strokes, prehistoric atmosphere, no faces in detail. 16:9. No text.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S15.png

- **2026-10-12T01:59:49** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Rough charcoal drawing on coarse stone-like grey paper, heavy grain, almost monochrome charcoal black with only a faint touch of yellow ochre: about ten thousand years ago on a hillside in North China, two or three hunter-gatherers wrapped in animal hides bend among wild green foxtail grass (Setaria viridis) — slender stems topped with cylindrical, bristly, nodding panicles that look like small fox tails, NOT wheat, NOT barley, NOT rice. One of them pinches off a bristly panicle that still clings to its stem and drops it into a hide pouch at his waist. Expressive smudged strokes and visible charcoal hatching, prehistoric atmosphere, faces not detailed. 16:9. No text.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v2\S15.png

- **2026-10-12T02:00:01** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Rough charcoal drawing on coarse stone-like grey paper, heavy grain, almost monochrome charcoal black with only a faint touch of yellow ochre: about ten thousand years ago on a hillside in North China, two or three hunter-gatherers wrapped in animal hides bend among wild green foxtail grass (Setaria viridis) — slender stems topped with cylindrical, bristly, nodding panicles that look like small fox tails, NOT wheat, NOT barley, NOT rice. One of them pinches off a bristly panicle that still clings to its stem and drops it into a hide pouch at his waist. Expressive smudged strokes and visible charcoal hatching, prehistoric atmosphere, faces not detailed. 16:9. No text.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v2\S15.png

### S33

- **2026-10-12T01:50:15** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Early spring experimental field in northern China: freshly ploughed soil drawn into neat shallow furrows, pale blue sky far away. A white-haired old man in a worn grey wool sweater crouches at the head of a furrow, seen from behind, holding an old kraft-paper envelope, top folded over twice, faint illegible pencil marks on it; beside him on the soil stands an old dented tin watering can. Soft cool morning light, a light breeze.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S33.png

### S20

- **2026-10-12T01:51:06** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Mural painting in the style of a High Tang dynasty Dunhuang Mogao cave wall painting, mineral pigments — azurite blue, malachite green, red ochre, earthy whites — on a mottled, flaking plaster wall with cracks and losses: farmers ploughing a field with an ox in the rain, a man carrying loads on a shoulder pole, rain falling in fine lines from dark rolling clouds, distant layered mountains and mist; full, balanced composition with flowing lines. 16:9. No text, no inscriptions.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S20.png

### S22

- **2026-10-12T01:51:27** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  1940s black-and-white documentary photograph, silver gelatin print with heavy grain, scratches and dust: the arched doorway of a yaodong cave dwelling on the Loess Plateau, a woven basket heaped with millet and an old bolt-action rifle leaning against the rammed-earth wall beside it, a cloth door curtain, hard slanting sunlight casting strong shadows. No people. No text.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S22.png

### S21

- **2026-10-12T01:51:45** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Ming dynasty Chinese woodblock print illustration in the manner of the 1637 book Tiangong Kaiwu: pure black ink lines on aged off-white paper, fine dense parallel hatching: on a threshing floor, farmers swing wooden flails to thresh grain and one tosses grain into the air to winnow it, grains flying, simple farm tools, a straw shed. Clean engraved line art, no colour. 16:9. No text, no characters, no seal.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v1\S21.png

### S30_1

- **2026-10-12T01:58:13** · MiniMax video · `MiniMax-H3`

  ```text
  1980年代彩色胶片质感，轻微胶片颗粒和闪烁。镜头固定，年轻人骑着二八自行车沿着坑洼的黄土路颠簸着向远处骑去，车轮扬起尘土，车把上的帆布包轻轻摇晃。背影，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S30-1.png", "last_frame": null, "task_id": "451331334320529"}`
  备注：round v1

### S30_2

- **2026-10-12T01:58:17** · MiniMax video · `MiniMax-H3`

  ```text
  1990年代胶片质感。镜头固定。风吹过谷子地，金黄低垂的谷穗轻轻摇晃；中年男人蹲在田埂上，低头在膝盖上的笔记本上写字，笔在纸上移动。不转头，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S30-2.png", "last_frame": null, "task_id": "451330366865817"}`
  备注：round v1

### S31_1

- **2026-10-12T01:58:22** · MiniMax video · `MiniMax-H3`

  ```text
  低角度仰拍，镜头固定。老妇人的双手把一束金黄低垂的谷穗举高，挂到房梁上，挂好后手慢慢松开，谷穗轻轻晃动，灰尘在窗光里漂浮。动作自然，手指数量正确，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S31-1.png", "last_frame": null, "task_id": "451326609564086"}`
  备注：round v1

### S31_3

- **2026-10-12T01:58:26** · MiniMax video · `MiniMax-H3`

  ```text
  低角度仰拍，镜头固定。老人的双手把一束金黄低垂的谷穗举高，挂到金属晒架的横杆上，挂好后手慢慢松开，谷穗轻轻晃动。动作自然，手指数量正确，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S31-3.png", "last_frame": null, "task_id": "451326720160190"}`
  备注：round v1

### S33a

- **2026-10-12T01:58:31** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定，背影。白发老人蹲在地头，把牛皮纸袋里浅黄色的谷粒细细撒进面前的浅土沟里，再用手掌把土轻轻抹平。早春晨光，微风吹动他的白发。不转头，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S33.png", "last_frame": null, "task_id": "451332093051142"}`
  备注：round v1

### S33b

- **2026-10-12T01:58:37** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定，背影。白发老人放下纸袋，拎起身边的旧铁皮水壶，沿着刚撒好种子的浅土沟慢慢浇水，水流细细落进土里。早春晨光，微风。不转头，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v1\\S33.png", "last_frame": null, "task_id": "451330091942290"}`
  备注：round v1

### S28

- **2026-10-12T01:59:41** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up under an old brass banker's desk lamp with a green glass shade: an old man's right hand holds an old black fountain pen and writes on a kraft-paper seed envelope lying on an old wooden desk, while his left hand, with an old stainless-steel-band wristwatch and grey wool sweater cuff, steadies the envelope. The handwriting on the envelope is small, faint and completely illegible, blurred by shallow depth of field. Warm amber pool of light, deep shadows around.
  
  Style: Black-and-amber film noir still, lit only by one old desk lamp: a warm tungsten pool of light on the desk falling off into deep black, high contrast, shallow depth of field, 35mm film grain, photorealistic. No text, no letters, no watermark. No visible face.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v2\S28.png

- **2026-10-12T01:59:49** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up under an old brass banker's desk lamp with a green glass shade: an old man's right hand holds an old black fountain pen and writes on a kraft-paper seed envelope lying on an old wooden desk, while his left hand, with an old stainless-steel-band wristwatch and grey wool sweater cuff, steadies the envelope. The handwriting on the envelope is small, faint and completely illegible, blurred by shallow depth of field. Warm amber pool of light, deep shadows around.
  
  Style: Black-and-amber film noir still, lit only by one old desk lamp: a warm tungsten pool of light on the desk falling off into deep black, high contrast, shallow depth of field, 35mm film grain, photorealistic. No text, no letters, no watermark. No visible face.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v2\S28.png

- **2026-10-12T02:01:36** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定，浅景深。老人右手握着旧钢笔，在牛皮纸信封上一笔一笔地慢慢写字，笔尖缓慢移动，左手按住信封。字迹细小模糊无法辨认。台灯暖光稳定。不出现人脸，手指数量正确。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v2\\S28.png", "last_frame": null, "task_id": "451328719622439"}`
  备注：round v1

### S30_3

- **2026-10-12T02:01:42** · MiniMax video · `MiniMax-H3`

  ```text
  镜头固定。风吹过谷子地，金黄低垂的谷穗轻轻摇晃；白发老人蹲在田埂上，低头在膝盖上的笔记本上写字，笔在纸上移动。不转头，不出现人脸。现代数码画质。
  ```
  参数：`{"resolution": "768P", "duration": 4, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v2\\S30-3.png", "last_frame": null, "task_id": "451329591787936"}`
  备注：round v1

### tex_knit

- **2026-10-12T02:12:52** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Close-up flat photograph of a worn grey wool sweater knit fabric filling the entire frame edge to edge: even diffuse lighting, no shadows, stockinette knit stitches clearly visible, a few loose fibers and slight pilling. Photorealistic texture, high detail, 16:9.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v1\tex_knit.png

### tex_chairwood

- **2026-10-12T02:12:55** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Flat even-lit close-up photograph of old worn elm wood filling the entire frame edge to edge: chipped dark lacquer, exposed lighter grain on the worn edges, long vertical wood grain. No objects, no shadows. Photorealistic texture, high detail, 16:9.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v1\tex_chairwood.png

### tex_kraft

- **2026-10-12T02:12:58** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Flat scan of brown kraft paper filling the entire frame edge to edge: even diffuse lighting, no shadows, visible paper fibers, soft creases and wrinkles, faint water stains and finger smudges, slightly darker edges from age. No text, no letters, no objects. Photorealistic texture, high detail, 16:9.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v1\tex_kraft.png

### tex_paper

- **2026-10-12T02:12:58** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Flat scan of old yellowed writing paper filling the entire frame edge to edge: even diffuse lighting, no shadows, faint foxing spots, fine paper fibers, slight discoloration toward the edges, very subtle creases. Completely blank: no text, no lines, no letters. Photorealistic texture, high detail, 16:9.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v1\tex_paper.png

### tex_desk

- **2026-10-12T02:13:02** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Top-down orthographic photograph of an old dark walnut wooden desk top, filling the entire frame edge to edge: flat, perfectly even diffuse lighting, no perspective, no objects, no shadows, no vignette. Worn dark-brown varnish with fine scratches and scuffs, faint pale rings from cups, small dents, subtle wood grain running horizontally across the frame, slightly lighter wear patches. Photorealistic texture, very high detail, 16:9.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v1\tex_desk.png

### S15-S22

- **2026-10-12T03:13:04** · OpenRouter music · `google/lyria-3-pro-preview`

  ```text
  Instrumental film score cue, about 50 seconds, for a montage that travels through ten thousand years of Chinese farming history. It opens sparse and ancient with a solo bone flute, then a clay xun takes over, then bronze chime bells (bianzhong), then a guqin, then a pipa, then a bamboo dizi flute - each instrument hands over to the next roughly every six seconds. Underneath, a low frame-drum pulse that slowly speeds up and grows, building momentum toward the end. Pentatonic, D minor, cinematic and intimate, not cheesy, no vocals, no lyrics. End on a sudden stop.
  ```
  产出：assets/audio/music/eras_lyria_v1.mp3
  备注：eras montage cue (log re-added after path error)

### S26-S37

- **2026-10-12T03:13:57** · OpenRouter music · `google/lyria-3-pro-preview`

  ```text
  Solo felt piano, very sparse: single notes and a few soft two-note chords with long silences between them. Tender, quiet and melancholic, very slow, free time, no strong melody and no big resolution. Recorded close with gentle room tone, like the memory of an old man in a quiet room at night. About 60 seconds. No other instruments, no vocals, no lyrics.
  ```
  产出：assets\audio\music\piano_lyria_v1.mp3
  备注：接你 piano cue

### tex_soil_section

- **2026-10-12T03:37:08** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Macro photograph through the glass wall of a soil observation box: a cross-section of moist dark brown soil filling the frame edge to edge — crumbly aggregates, fine roots absent, tiny air pockets, a few sand grains glinting, soft diffused light from above, shallow depth of field, nothing else. Photorealistic, very high detail, 16:9, no text.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v2\tex_soil_section.png

### tex_soil

- **2026-10-12T03:37:14** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Top-down orthographic photograph of freshly tilled dark brown loam soil filling the entire frame edge to edge, slightly moist, fine crumbs and small clods, a few tiny pebbles and bits of dry straw, flat even diffuse daylight, no shadows, no objects, no plants. Photorealistic texture, very high detail, 16:9.
  ```
  参数：`{"refs": []}`
  产出：assets\textures\v2\tex_soil.png

### S32

- **2026-10-12T03:42:22** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Inside an agricultural research station drying room: rows of horizontal galvanized metal drying bars, each hung with many bunches of ripe golden foxtail millet heads hanging head-down, thick bristly cylindrical panicles. Strong late-afternoon sunlight streams in from high windows behind the racks: backlight makes the bristles glow with a golden halo, visible shafts of light full of drifting dust. Camera low, looking slightly up along the rows. Quiet, reverent, cinematic.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v3\S32.png

- **2026-10-12T03:44:26** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Inside an agricultural research station drying room: rows of horizontal galvanized metal drying bars, each hung with many bunches of ripe golden foxtail millet heads hanging head-down, thick bristly cylindrical panicles. Strong late-afternoon sunlight streams in from high windows behind the racks: backlight makes the bristles glow with a golden halo, visible shafts of light full of drifting dust. Camera low, looking slightly up along the rows. Quiet, reverent, cinematic. Absolutely no people, no human figures anywhere in the frame — only the racks, the millet, the light and the dust.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v3\S32_b.png

- **2026-10-12T03:46:17** · MiniMax video · `MiniMax-H3`

  ```text
  镜头沿着晒架极其缓慢地横向平移。逆光中，灰尘在光柱里缓缓漂浮，低垂的谷穗几乎静止，偶尔轻轻晃动。安静，没有人，没有人物进入画面。
  ```
  参数：`{"resolution": "768P", "duration": 5, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v3\\S32_b.png", "last_frame": null, "task_id": "451358211694859"}`
  备注：round v2

### S27

- **2026-10-12T03:42:36** · Codex CLI image_generation · `codex (ChatGPT image tool)`

  ```text
  Wide shot inside an old agricultural seed storage room at night: on all four walls, grey steel shelving units reaching the ceiling, packed with thousands of small kraft-paper seed envelopes standing in neat rows, each with a small handwritten label. In the middle of the room, an old wooden desk with an old brass banker's desk lamp with a green glass shade glowing — the only warm light — and a white-haired old man in a worn grey wool sweater sitting at the desk with his back to the camera, his face not visible. Camera slightly above the lamp height, looking down across the room. Deep shadows, warm pool of lamp light, cinematic, quiet.
  
  Style: Cinematic film still, shot on 35mm Kodak Vision3 500T, visible fine film grain, low-saturation warm grey palette, soft natural light, shallow depth of field, photorealistic, restrained and quiet mood. No text, no letters, no watermark, no logo. No visible face; any person is seen from behind, in silhouette, or only as hands.
  ```
  参数：`{"refs": []}`
  产出：assets\stills\v3\S27.png

- **2026-10-12T03:43:15** · MiniMax video · `MiniMax-H3`

  ```text
  镜头从台灯的高度缓慢升起，同时向后拉开，逐渐展现整个种子储藏室：四面顶到天花板的铁架上码满牛皮纸种子袋。坐在桌前的白发老人背对镜头，几乎不动。台灯暖光稳定，灰尘在光里漂浮。运镜平稳缓慢，不出现人脸。
  ```
  参数：`{"resolution": "768P", "duration": 5, "first_frame": "D:\\Project N2\\AI _Videos\\assets\\stills\\v3\\S27.png", "last_frame": null, "task_id": "451358605595010"}`
  备注：round v2
