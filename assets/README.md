# 背景图片 / 动图 / 视频

把文件放进本目录，贴纸会自动引用，不需要在设置里上传：

静态图：

- `background.jpg`（推荐）
- `background.jpeg`
- `background.png`
- `background.webp`
- `background.avif`
- `background.svg`

动图（会动）：

- `background.gif`
- `background.apng`

短视频（静音循环播放，最大 40MB）：

- `background.mp4`
- `background.webm`

同一目录里留下多个时按上面的顺序取第一个。替换文件后刷新页面即可（服务端不缓存）。

也可以在贴纸的设置里点「选择图片/视频」：文件会**原样复制**到本目录（保留原格式与画质，
最大 40MB），并覆盖旧的 `background.*`；「移除」会删掉这些文件。

设置里还有「背景亮度」滑杆，0%–100% 随时调节明暗（越高越亮）。

浏览器显示不了的格式（例如 iPhone 的 HEIC）会直接提示，请先转成 JPG / PNG / WebP；
视频请用 MP4 / WebM。

存在背景时，卡片会去掉橙色渐变，按画面明暗自动使用「媒体 + 蒙层 + 深色字/奶白字」；
没有背景时保持橙色渐变。
