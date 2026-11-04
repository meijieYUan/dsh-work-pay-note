# Work Pay Note · 上班赚钱

A draggable sticky note for **DeepSeek Harness** that counts **today's** and **this month's** earnings in real time from your work schedule. Drop it anywhere on the Web UI, glance at it during the day, collapse it when you do not need it.

一款挂在 DeepSeek Harness 界面上的「上班赚钱」提示贴：按你的上下班时间实时计算今天和本月赚到的金额，可拖动、可收起。

## Features · 功能

- **Live today's pay** — accrues per second inside your working hours, pauses over lunch, stops at the end of the day.
- **Month-to-date** — prorated by the weekdays of the current month (Monday–Friday), with the month target and a progress bar.
- **Today's progress ring** — a quick read of how much of the workday is done.
- **Schedule aware** — start/end time and lunch break are configurable; the card shows the schedule and the time left until off work.
- **Background media** — an optional photo, GIF/APNG/animated WebP, or a short MP4/WebM loop, with a brightness slider. Bright media switches the card to a light veil with dark text; dark media keeps cream text. Without a background the card keeps its orange gradient.
- **Stays out of the way** — drag it by the header, collapse it to a small pill, reopen with one click.
- **Local only** — no network calls beyond the local background route; settings never leave the machine.

## Install · 安装

Install it from the DeepSeek Harness plugin market (Plugins → Discover) once listed.

Or point `dsh` at this repository:

```sh
dsh plugin --profile web add https://github.com/meijieYUan/dsh-work-pay-note
```

Then restart the app (or reload the Web UI). The card appears in the bottom-right corner.

No build step and no runtime dependencies: the package ships plain ESM host code and a plain browser module.

## Use · 使用

1. Click the sliders icon on the card and set your monthly pay, start/end time and lunch break.
2. Optionally pick a background under **Background**, and tune its brightness.
3. Drag the card by its header; the chevron collapses it to a pill.

### Background storage · 背景图片存放

The background file lives in the plugin's own `assets/` folder (`background.jpg` / `.png` / `.gif` / `.mp4` / `.webm` …). Picking a file in settings copies it there; you can also drop a file in by hand.

Because it lives inside the plugin folder, **updating or reinstalling the plugin replaces that folder**, so an uploaded background may need to be picked again afterwards.

## How the numbers work · 计算方式

- Daily pay = monthly pay ÷ number of weekdays in the current month.
- Today's pay = worked minutes today × daily pay ÷ scheduled working minutes, lunch excluded.
- Month-to-date = completed weekdays × daily pay + today's pay.
- Holidays are not modelled; adjust the schedule if a day differs.

## License

MIT
