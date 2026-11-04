window.__ModuleLoader__.load({
  id: 'dsh-work-pay-note',
  factory(require) {
    const module = { exports: {} };
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useReducer, useRef } = React;

    const NS = 'workpay.note';
    const SETTINGS_KEY = 'dsh.workpay.settings.v1';
    const POS_KEY = 'dsh.workpay.pos.v1';
    const COLLAPSED_KEY = 'dsh.workpay.collapsed.v1';
    const PHOTO_KEY = 'dsh.workpay.photo.v1';
    const PHOTO_ROUTE = '/work-pay-note/background';
    const BRIGHTNESS_KEY = 'dsh.workpay.brightness.v1';

    /** Monday..Friday; the note prorates by the real weekdays of the month. */
    const WORKWEEK = [1, 2, 3, 4, 5];
    const DEFAULT_SETTINGS = Object.freeze({
      salary: 12000,
      start: '09:00',
      end: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
    });

    const zh = {
      title: '上班赚钱',
      today: '今日已赚',
      monthTotal: '本月累计',
      monthTarget: '本月预计',
      'status.working': '工作中',
      'status.lunch': '午休中',
      'status.before': '未开工',
      'status.done': '已下班',
      'status.weekend': '休息日',
      'status.idle': '未设置',
      toOffWork: '距下班',
      toStart: '距上班',
      doneToday: '今日已完工',
      perHour: '时薪',
      workdaysUnit: '个工作日',
      workHours: '上下班',
      settings: '设置',
      salary: '月薪',
      lunch: '午休',
      lunchHint: '午休留空表示不扣除这段时间',
      calcHint: '按周一至周五、当月实际工作日折算',
      photo: '背景图 / 视频',
      choosePhoto: '选择图片/视频',
      changePhoto: '更换',
      removePhoto: '移除',
      photoBrightness: '背景亮度',
      photoFormatError: '这个格式浏览器显示不了，请换成 JPG / PNG / WebP，或 MP4 / WebM',
      photoError: '图片保存失败，请重试',
      save: '保存',
      cancel: '取消',
      close: '关闭',
      collapse: '收起',
      expand: '展开',
      invalid: '请检查月薪与时间段',
    };

    const en = {
      title: 'On the clock',
      today: 'Earned today',
      monthTotal: 'This month',
      monthTarget: 'Month target',
      'status.working': 'Working',
      'status.lunch': 'Lunch break',
      'status.before': 'Not started',
      'status.done': 'Clock out',
      'status.weekend': 'Day off',
      'status.idle': 'Not set',
      toOffWork: 'Until off',
      toStart: 'Until start',
      doneToday: 'Done for today',
      perHour: 'Per hour',
      workdaysUnit: 'workdays',
      workHours: 'Hours',
      settings: 'Settings',
      salary: 'Monthly pay',
      lunch: 'Lunch',
      lunchHint: 'Leave the lunch times blank to count the whole span',
      calcHint: 'Weekdays only, prorated by this month’s workdays',
      photo: 'Background',
      choosePhoto: 'Choose image/video',
      changePhoto: 'Change',
      removePhoto: 'Remove',
      photoBrightness: 'Brightness',
      photoFormatError: 'The browser cannot display this format; use JPG, PNG, WebP, MP4 or WebM',
      photoError: 'Could not save the file, try again',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      collapse: 'Collapse',
      expand: 'Expand',
      invalid: 'Check the monthly pay and time ranges',
    };

    const CSS = `
.wpn-root {
  position: fixed;
  z-index: 45;
  pointer-events: auto;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.35;
  color: #2B1608;
  --wpn-ink: #2B1608;
  --wpn-ink-soft: rgba(43, 22, 8, .86);
  --wpn-line: rgba(255, 255, 255, .42);
  --wpn-ink-line: rgba(43, 22, 8, .2);
  --wpn-chip-bg: rgba(255, 255, 255, .26);
  --wpn-chip-border: rgba(255, 255, 255, .42);
  --wpn-chip-text: rgba(43, 22, 8, .8);
  --wpn-panel-bg: rgba(255, 246, 236, .34);
  --wpn-panel-border: rgba(255, 255, 255, .44);
  --wpn-track: rgba(255, 246, 236, .55);
  --wpn-arc: #2B1608;
  --wpn-bar: linear-gradient(90deg, #2B1608, #5C2A0C);
  --wpn-input-bg: rgba(255, 255, 255, .34);
  --wpn-input-border: rgba(43, 22, 8, .2);
  --wpn-primary-bg: #2B1608;
  --wpn-primary-text: #FFE9D2;
  --wpn-error: #7A1B0B;
  --wpn-dot: rgba(43, 22, 8, .4);
  --wpn-dot-muted: rgba(43, 22, 8, .55);
  --wpn-pulse: rgba(43, 22, 8, .32);
  --wpn-shadow: 0 22px 44px -22px rgba(122, 45, 8, .45);
  --wpn-grad: linear-gradient(135deg, #FFC58B 0%, #FF9C56 44%, #F0702F 100%);
  --wpn-photo: none;
  --wpn-photo-veil: .4;
  -webkit-font-smoothing: antialiased;
}
.wpn-card {
  position: relative;
  width: 372px;
  height: 230px;
  box-sizing: border-box;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  color: var(--wpn-ink);
  background-color: #FF9C56;
  background-image:
    radial-gradient(120% 90% at 8% -12%, rgba(255, 255, 255, .3), rgba(255, 255, 255, 0) 58%),
    var(--wpn-grad);
  border: 1px solid var(--wpn-line);
  box-shadow: var(--wpn-shadow), inset 0 1px 0 rgba(255, 255, 255, .35);
  user-select: none;
  overflow: hidden;
  transition: box-shadow .2s ease, background-color .2s ease;
}
.wpn-card:hover {
  box-shadow: 0 26px 52px -22px rgba(90, 35, 5, .55), inset 0 1px 0 rgba(255, 255, 255, .4);
}
/*
 * Photo mode: a custom background exists, so the orange gradient is dropped and
 * the picture carries the card. A warm dark scrim keeps the cream text readable.
 */
.wpn-card.has-photo {
  --wpn-ink: #FFF6EC;
  --wpn-ink-soft: rgba(255, 246, 236, .86);
  --wpn-line: rgba(255, 255, 255, .2);
  --wpn-ink-line: rgba(255, 255, 255, .22);
  --wpn-chip-bg: rgba(22, 10, 4, .3);
  --wpn-chip-border: rgba(255, 255, 255, .18);
  --wpn-chip-text: rgba(255, 246, 236, .9);
  --wpn-panel-bg: rgba(18, 9, 4, .32);
  --wpn-panel-border: rgba(255, 255, 255, .14);
  --wpn-track: rgba(255, 255, 255, .25);
  --wpn-arc: #FFF6EC;
  --wpn-bar: linear-gradient(90deg, #FFF6EC, rgba(255, 246, 236, .7));
  --wpn-input-bg: rgba(255, 255, 255, .12);
  --wpn-input-border: rgba(255, 255, 255, .22);
  --wpn-primary-bg: #FFF6EC;
  --wpn-primary-text: #3A1C08;
  --wpn-error: #FFC9A8;
  --wpn-dot: rgba(255, 246, 236, .7);
  --wpn-dot-muted: rgba(255, 246, 236, .45);
  --wpn-pulse: rgba(255, 246, 236, .32);
  --wpn-shadow: 0 22px 44px -22px rgba(0, 0, 0, .55);
  color: var(--wpn-ink);
  background-color: #2A1A12;
  background-image:
    linear-gradient(
      160deg,
      rgba(22, 10, 4, calc(.35 + var(--wpn-photo-veil, .4) * .35)),
      rgba(22, 10, 4, calc(.47 + var(--wpn-photo-veil, .4) * .3))
    ),
    var(--wpn-photo);
  background-size: cover;
  background-position: center;
  border-color: rgba(255, 255, 255, .2);
  box-shadow: var(--wpn-shadow), inset 0 1px 0 rgba(255, 255, 255, .12);
}
.wpn-card.has-photo:hover {
  box-shadow: 0 26px 52px -22px rgba(0, 0, 0, .6), inset 0 1px 0 rgba(255, 255, 255, .16);
}
/*
 * A bright picture keeps its own light: the scrim becomes a white veil and the
 * ink turns dark, so the photo stays luminous instead of being dimmed.
 */
.wpn-card.has-photo.is-light {
  --wpn-ink: #2B1608;
  --wpn-ink-soft: rgba(43, 22, 8, .84);
  --wpn-line: rgba(43, 22, 8, .18);
  --wpn-ink-line: rgba(43, 22, 8, .2);
  --wpn-chip-bg: rgba(255, 255, 255, .42);
  --wpn-chip-border: rgba(255, 255, 255, .6);
  --wpn-chip-text: rgba(43, 22, 8, .84);
  --wpn-panel-bg: rgba(255, 246, 236, .55);
  --wpn-panel-border: rgba(255, 255, 255, .65);
  --wpn-track: rgba(43, 22, 8, .18);
  --wpn-arc: #2B1608;
  --wpn-bar: linear-gradient(90deg, #2B1608, #5C2A0C);
  --wpn-input-bg: rgba(255, 255, 255, .52);
  --wpn-input-border: rgba(43, 22, 8, .2);
  --wpn-primary-bg: #2B1608;
  --wpn-primary-text: #FFE9D2;
  --wpn-error: #7A1B0B;
  --wpn-dot: rgba(43, 22, 8, .4);
  --wpn-dot-muted: rgba(43, 22, 8, .55);
  --wpn-pulse: rgba(43, 22, 8, .32);
  --wpn-shadow: 0 22px 44px -22px rgba(60, 30, 10, .3);
  color: var(--wpn-ink);
  background-color: #F3E2D0;
  background-image:
    linear-gradient(
      160deg,
      rgba(255, 255, 255, calc(.08 + var(--wpn-photo-veil, .4) * .35)),
      rgba(255, 255, 255, calc(.02 + var(--wpn-photo-veil, .4) * .25))
    ),
    var(--wpn-photo);
  border-color: rgba(255, 255, 255, .62);
  box-shadow: var(--wpn-shadow), inset 0 1px 0 rgba(255, 255, 255, .5);
}
.wpn-card.has-photo.is-light:hover {
  box-shadow: 0 26px 52px -22px rgba(60, 30, 10, .4), inset 0 1px 0 rgba(255, 255, 255, .55);
}
.wpn-card.is-editing { height: auto; }
.wpn-card.has-photo.is-editing {
  background-image:
    linear-gradient(
      160deg,
      rgba(18, 8, 3, calc(.52 + var(--wpn-photo-veil, .4) * .28)),
      rgba(18, 8, 3, calc(.62 + var(--wpn-photo-veil, .4) * .25))
    ),
    var(--wpn-photo);
}
.wpn-card.has-photo.is-light.is-editing {
  background-image:
    linear-gradient(
      160deg,
      rgba(255, 255, 255, calc(.3 + var(--wpn-photo-veil, .4) * .3)),
      rgba(255, 255, 255, calc(.18 + var(--wpn-photo-veil, .4) * .22))
    ),
    var(--wpn-photo);
}
.wpn-photo-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}
.wpn-photo-veil {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(
      160deg,
      rgba(22, 10, 4, calc(.35 + var(--wpn-photo-veil, .4) * .35)),
      rgba(22, 10, 4, calc(.47 + var(--wpn-photo-veil, .4) * .3))
    );
}
.wpn-card.is-light .wpn-photo-veil {
  background-image:
    linear-gradient(
      160deg,
      rgba(255, 255, 255, calc(.08 + var(--wpn-photo-veil, .4) * .35)),
      rgba(255, 255, 255, calc(.02 + var(--wpn-photo-veil, .4) * .25))
    );
}
.wpn-card.is-editing .wpn-photo-veil {
  background-image:
    linear-gradient(
      160deg,
      rgba(18, 8, 3, calc(.52 + var(--wpn-photo-veil, .4) * .28)),
      rgba(18, 8, 3, calc(.62 + var(--wpn-photo-veil, .4) * .25))
    );
}
.wpn-card.is-light.is-editing .wpn-photo-veil {
  background-image:
    linear-gradient(
      160deg,
      rgba(255, 255, 255, calc(.3 + var(--wpn-photo-veil, .4) * .3)),
      rgba(255, 255, 255, calc(.18 + var(--wpn-photo-veil, .4) * .22))
    );
}
.wpn-card > * { position: relative; z-index: 1; }
.wpn-card > .wpn-photo-video, .wpn-card > .wpn-photo-veil {
  position: absolute;
  z-index: 0;
}
.wpn-head {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: grab;
  touch-action: none;
}
.wpn-root.is-dragging .wpn-head { cursor: grabbing; }
.wpn-dot {
  width: 6px;
  height: 6px;
  flex: none;
  border-radius: 50%;
  background: var(--wpn-dot);
}
.wpn-dot[data-status="working"] {
  background: var(--wpn-ink);
  animation: wpn-pulse 2.6s ease-in-out infinite;
}
.wpn-dot[data-status="lunch"] { background: var(--wpn-dot-muted); }
.wpn-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  white-space: nowrap;
  color: var(--wpn-ink);
}
.wpn-status {
  padding: 1px 7px;
  border: 1px solid var(--wpn-chip-border);
  border-radius: 999px;
  background: var(--wpn-chip-bg);
  font-size: 10px;
  line-height: 1.5;
  white-space: nowrap;
  color: var(--wpn-chip-text);
}
.wpn-actions { margin-left: auto; display: flex; align-items: center; gap: 1px; }
.wpn-icon-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--wpn-ink-soft);
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: .8;
  transition: opacity .15s ease, background-color .15s ease, color .15s ease;
}
.wpn-icon-btn:hover {
  opacity: 1;
  background: var(--wpn-chip-bg);
  color: var(--wpn-ink);
}
.wpn-icon-btn:focus-visible, .wpn-btn:focus-visible, .wpn-pill:focus-visible {
  outline: 2px solid var(--wpn-ink);
  outline-offset: 2px;
}
.wpn-body { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; min-height: 0; }
.wpn-panel {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 5px 12px;
  border: 1px solid var(--wpn-panel-border);
  border-radius: 13px;
  background: var(--wpn-panel-bg);
}
.wpn-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: none;
}
.wpn-hero-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 1px;
  flex: none;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink-soft);
}
.wpn-hero-main { min-width: 0; }
.wpn-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
  font-size: 10px;
  letter-spacing: .05em;
  color: var(--wpn-ink-soft);
}
.wpn-label::before {
  content: "";
  width: 12px;
  height: 2px;
  border-radius: 2px;
  background: var(--wpn-ink);
  opacity: .55;
}
.wpn-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -.015em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--wpn-ink);
}
.wpn-cur {
  font-size: 13px;
  font-weight: 500;
  color: var(--wpn-ink-soft);
}
.wpn-sched {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--wpn-ink-soft);
}
.wpn-ring { position: relative; width: 48px; height: 48px; flex: none; }
.wpn-ring svg { display: block; width: 48px; height: 48px; }
.wpn-ring-track { stroke: var(--wpn-track); }
.wpn-ring-fill {
  stroke: var(--wpn-arc);
  transition: stroke-dashoffset .5s cubic-bezier(.4, 0, .2, 1);
}
.wpn-ring-text {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink);
}
.wpn-month-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}
.wpn-stat { min-width: 0; display: flex; flex-direction: row; align-items: baseline; gap: 4px; white-space: nowrap; }
.wpn-stat.is-right { text-align: right; }
.wpn-stat-label {
  font-size: 9.5px;
  letter-spacing: .03em;
  color: var(--wpn-ink-soft);
}
.wpn-stat-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink);
}
.wpn-stat-value .wpn-cur { font-size: 10px; }
.wpn-stat-muted {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink-soft);
}
.wpn-progress { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 3px; }
.wpn-track {
  position: relative;
  width: 100%;
  flex: none;
  height: 3px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--wpn-track);
}
.wpn-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--wpn-bar);
  transition: width .5s cubic-bezier(.4, 0, .2, 1);
}
.wpn-pct {
  font-size: 9.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink-soft);
}
.wpn-form { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
.wpn-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 27px;
}
.wpn-field-label {
  font-size: 11px;
  white-space: nowrap;
  color: var(--wpn-ink-soft);
}
.wpn-input {
  width: 110px;
  height: 27px;
  box-sizing: border-box;
  padding: 0 7px;
  border: 1px solid var(--wpn-input-border);
  border-radius: 8px;
  background: var(--wpn-input-bg);
  color: var(--wpn-ink);
  font: inherit;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  user-select: text;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.wpn-input:focus {
  border-color: var(--wpn-ink);
  box-shadow: 0 0 0 3px var(--wpn-chip-bg);
}
.wpn-input::-webkit-outer-spin-button, .wpn-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.wpn-times { display: flex; align-items: center; gap: 4px; }
.wpn-times .wpn-input { width: 80px; padding: 0 2px; text-align: center; }
.wpn-tilde { font-size: 10px; color: var(--wpn-ink-soft); }
.wpn-photo-ctl { display: flex; align-items: center; gap: 6px; }
.wpn-thumb {
  width: 24px;
  height: 24px;
  flex: none;
  border: 1px solid rgba(255, 255, 255, .5);
  border-radius: 7px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .18);
}
.wpn-mini {
  height: 26px;
  padding: 0 10px;
  border: 1px solid var(--wpn-input-border);
  border-radius: 8px;
  background: var(--wpn-input-bg);
  color: var(--wpn-ink);
  font: inherit;
  font-size: 10.5px;
  cursor: pointer;
}
.wpn-mini:hover { background: var(--wpn-chip-bg); }
.wpn-mini.is-quiet { background: transparent; color: var(--wpn-ink-soft); }
.wpn-mini:disabled { opacity: .5; cursor: default; }
.wpn-hint {
  margin-top: 5px;
  font-size: 10px;
  line-height: 1.45;
  color: var(--wpn-ink-soft);
  opacity: .92;
}
.wpn-form .wpn-hint { margin-top: 0; }
.wpn-error { font-size: 10px; color: var(--wpn-error); }
.wpn-form-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 3px; }
.wpn-btn {
  height: 27px;
  padding: 0 13px;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.wpn-btn.is-ghost {
  border-color: var(--wpn-ink-line);
  background: transparent;
  color: var(--wpn-ink-soft);
}
.wpn-btn.is-ghost:hover { color: var(--wpn-ink); }
.wpn-btn.is-primary {
  background: var(--wpn-primary-bg);
  color: var(--wpn-primary-text);
  font-weight: 600;
}
.wpn-btn.is-primary:hover { filter: brightness(1.06); }
.wpn-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid var(--wpn-line);
  border-radius: 14px;
  color: var(--wpn-ink);
  background-color: #FF9C56;
  background-image:
    radial-gradient(120% 90% at 8% -12%, rgba(255, 255, 255, .32), rgba(255, 255, 255, 0) 58%),
    var(--wpn-grad);
  box-shadow: var(--wpn-shadow);
  font-size: 11px;
  cursor: pointer;
  user-select: none;
  transition: box-shadow .15s ease;
}
.wpn-pill.has-photo {
  --wpn-ink: #FFF6EC;
  --wpn-ink-soft: rgba(255, 246, 236, .85);
  --wpn-line: rgba(255, 255, 255, .2);
  color: var(--wpn-ink);
  background-color: #2A1A12;
  background-image:
    linear-gradient(
      135deg,
      rgba(22, 10, 4, calc(.3 + var(--wpn-photo-veil, .4) * .4)),
      rgba(22, 10, 4, calc(.4 + var(--wpn-photo-veil, .4) * .35))
    ),
    var(--wpn-photo);
  background-size: cover;
  background-position: center;
  border-color: rgba(255, 255, 255, .2);
}
.wpn-pill.has-photo.is-light {
  --wpn-ink: #2B1608;
  --wpn-ink-soft: rgba(43, 22, 8, .84);
  --wpn-line: rgba(43, 22, 8, .18);
  color: var(--wpn-ink);
  background-color: #F3E2D0;
  background-image:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, calc(.1 + var(--wpn-photo-veil, .4) * .4)),
      rgba(255, 255, 255, calc(.04 + var(--wpn-photo-veil, .4) * .28))
    ),
    var(--wpn-photo);
  border-color: rgba(255, 255, 255, .62);
}
.wpn-pill:hover { box-shadow: 0 18px 38px -20px rgba(90, 35, 5, .55); }
.wpn-pill.has-photo:hover { box-shadow: 0 18px 38px -20px rgba(0, 0, 0, .6); }
.wpn-pill-amount { font-weight: 600; font-variant-numeric: tabular-nums; }
.wpn-pill-label { font-size: 10px; color: var(--wpn-ink-soft); }
.wpn-pill-divider {
  width: 1px;
  height: 10px;
  background: var(--wpn-line);
}
.wpn-pill-month {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink-soft);
}
.wpn-range-wrap { display: flex; align-items: center; gap: 6px; }
.wpn-range {
  width: 132px;
  height: 26px;
  margin: 0;
  background: transparent;
  accent-color: var(--wpn-ink);
  cursor: pointer;
}
.wpn-range-value {
  min-width: 30px;
  text-align: right;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--wpn-ink-soft);
}
@keyframes wpn-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--wpn-pulse); }
  50% { opacity: .6; box-shadow: 0 0 0 4px transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .wpn-dot { animation: none !important; }
  .wpn-fill, .wpn-ring-fill { transition: none !important; }
}
`;

    // ------------------------------------------------------------- storage

    function read(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw == null ? null : JSON.parse(raw);
      } catch (error) {
        return null;
      }
    }

    function write(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        /* a full or blocked storage must not break the note */
      }
    }

    /*
     * localStorage is origin-bound, and a Web UI served from another port would
     * start empty. The salary lives in a cookie too, which ignores the port, so
     * the schedule survives that restart.
     */
    function readCookie() {
      try {
        const match = new RegExp('(?:^|; )workpay_settings=([^;]*)').exec(document.cookie);
        return match ? JSON.parse(decodeURIComponent(match[1])) : null;
      } catch (error) {
        return null;
      }
    }

    function writeCookie(value) {
      try {
        document.cookie =
          'workpay_settings=' +
          encodeURIComponent(JSON.stringify(value)) +
          '; path=/; max-age=31536000; SameSite=Lax';
      } catch (error) {
        /* cookies may be blocked; localStorage remains the primary store */
      }
    }

    function loadStoredSettings() {
      const stored = read(SETTINGS_KEY);
      return stored == null ? readCookie() : stored;
    }

    function saveSettings(value) {
      write(SETTINGS_KEY, value);
      writeCookie(value);
    }

    // --------------------------------------------------------- time helpers

    function parseHM(value) {
      const match = /^(\d{1,2}):(\d{2})$/.exec(String(value == null ? '' : value).trim());
      if (!match) return null;
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      if (hours > 23 || minutes > 59) return null;
      return hours * 60 + minutes;
    }

    function pad2(value) {
      return (value < 10 ? '0' : '') + value;
    }

    function formatHM(total) {
      return pad2(Math.floor(total / 60)) + ':' + pad2(total % 60);
    }

    function normalizeHM(value) {
      const minutes = parseHM(value);
      return minutes == null ? '' : formatHM(minutes);
    }

    function normalizeSettings(raw) {
      if (!raw || typeof raw !== 'object') return null;
      const salary = Number(raw.salary);
      if (!Number.isFinite(salary) || salary <= 0) return null;
      const start = normalizeHM(raw.start);
      const end = normalizeHM(raw.end);
      if (!start || !end) return null;
      const startMin = parseHM(start);
      const endMin = parseHM(end);
      if (endMin <= startMin) return null;
      let lunchStart = '';
      let lunchEnd = '';
      const rawLunchStart = String(raw.lunchStart == null ? '' : raw.lunchStart).trim();
      const rawLunchEnd = String(raw.lunchEnd == null ? '' : raw.lunchEnd).trim();
      if (rawLunchStart || rawLunchEnd) {
        const lunchStartMin = parseHM(rawLunchStart);
        const lunchEndMin = parseHM(rawLunchEnd);
        if (lunchStartMin == null || lunchEndMin == null) return null;
        if (lunchStartMin <= startMin || lunchEndMin > endMin || lunchEndMin <= lunchStartMin) return null;
        lunchStart = formatHM(lunchStartMin);
        lunchEnd = formatHM(lunchEndMin);
      }
      return {
        salary: Math.min(salary, 100000000),
        start,
        end,
        lunchStart,
        lunchEnd,
      };
    }

    function scheduleIntervals(settings) {
      const startMin = parseHM(settings.start);
      const endMin = parseHM(settings.end);
      if (startMin == null || endMin == null || endMin <= startMin) return [];
      const lunchStartMin = parseHM(settings.lunchStart);
      const lunchEndMin = parseHM(settings.lunchEnd);
      if (
        lunchStartMin != null &&
        lunchEndMin != null &&
        lunchStartMin > startMin &&
        lunchEndMin > lunchStartMin &&
        lunchEndMin <= endMin
      ) {
        return [
          [startMin, lunchStartMin],
          [lunchEndMin, endMin],
        ];
      }
      return [[startMin, endMin]];
    }

    function formatDuration(totalMinutes) {
      const total = Math.max(0, Math.round(totalMinutes));
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      if (hours <= 0) return minutes + 'm';
      if (minutes === 0) return hours + 'h';
      return hours + 'h' + pad2(minutes) + 'm';
    }

    function money(value) {
      const amount = Number.isFinite(value) ? value : 0;
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    function clampPosition(x, y, width, height) {
      const maxX = Math.max(8, window.innerWidth - width - 8);
      const maxY = Math.max(8, window.innerHeight - height - 8);
      return {
        x: Math.min(Math.max(8, x), maxX),
        y: Math.min(Math.max(8, y), maxY),
      };
    }

    function readPosition() {
      const stored = read(POS_KEY);
      if (!stored || typeof stored.x !== 'number' || typeof stored.y !== 'number') return null;
      if (!Number.isFinite(stored.x) || !Number.isFinite(stored.y)) return null;
      return { x: stored.x, y: stored.y };
    }

    // -------------------------------------------------------------- numbers

    function computeStats(settings, now) {
      const intervals = scheduleIntervals(settings);
      const dailyMinutes = intervals.reduce((sum, interval) => sum + (interval[1] - interval[0]), 0);
      const lunchMinutes = intervals.length > 1 ? intervals[1][0] - intervals[0][1] : 0;

      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let totalWorkdays = 0;
      let completedDays = 0;
      for (let day = 1; day <= daysInMonth; day += 1) {
        if (WORKWEEK.indexOf(new Date(year, month, day, 12).getDay()) >= 0) {
          totalWorkdays += 1;
          if (day < date) completedDays += 1;
        }
      }

      const scheduledDay = WORKWEEK.indexOf(now.getDay()) >= 0;
      const isWorkday = scheduledDay && dailyMinutes > 0;
      const nowMinute =
        now.getHours() * 60 +
        now.getMinutes() +
        now.getSeconds() / 60 +
        now.getMilliseconds() / 60000;

      let workedMinute = 0;
      intervals.forEach((interval) => {
        if (nowMinute > interval[0]) workedMinute += Math.min(nowMinute, interval[1]) - interval[0];
      });
      if (workedMinute < 0) workedMinute = 0;
      if (workedMinute > dailyMinutes) workedMinute = dailyMinutes;

      const dailyPay = totalWorkdays > 0 ? settings.salary / totalWorkdays : 0;
      const payPerMinute = dailyMinutes > 0 ? dailyPay / dailyMinutes : 0;
      const todayPay = isWorkday ? workedMinute * payPerMinute : 0;
      const monthPay = completedDays * dailyPay + todayPay;
      const dayProgress = isWorkday && dailyMinutes > 0 ? Math.min(1, workedMinute / dailyMinutes) : 0;
      const monthProgress =
        totalWorkdays > 0
          ? Math.min(1, (completedDays + (isWorkday ? dayProgress : 0)) / totalWorkdays)
          : 0;
      const hourlyPay = dailyMinutes > 0 ? dailyPay / (dailyMinutes / 60) : 0;

      const startMinute = intervals.length > 0 ? intervals[0][0] : 0;
      const endMinute = intervals.length > 0 ? intervals[intervals.length - 1][1] : 0;
      let status = 'idle';
      if (intervals.length === 0) status = 'idle';
      else if (!scheduledDay) status = 'weekend';
      else if (nowMinute < startMinute) status = 'before';
      else if (nowMinute >= endMinute) status = 'done';
      else if (lunchMinutes > 0 && nowMinute >= intervals[0][1] && nowMinute < intervals[1][0]) status = 'lunch';
      else status = 'working';

      let remaining = 0;
      if (status === 'working' || status === 'lunch') remaining = Math.max(0, endMinute - nowMinute);
      else if (status === 'before') remaining = Math.max(0, startMinute - nowMinute);

      return {
        intervals,
        dailyMinutes,
        lunchMinutes,
        totalWorkdays,
        completedDays,
        isWorkday,
        todayPay,
        monthPay,
        dailyPay,
        hourlyPay,
        dayProgress,
        monthProgress,
        status,
        remaining,
      };
    }

    // ---------------------------------------------------------------- icons

    function icon(children) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 13,
          height: 13,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        children,
      );
    }

    function slidersIcon() {
      return icon([
        h('path', { key: 'a', d: 'M2.5 4.5h6.4M12.2 4.5h1.3' }),
        h('circle', { key: 'b', cx: 10.55, cy: 4.5, r: 1.55 }),
        h('path', { key: 'c', d: 'M2.5 11.5h1.3M7.1 11.5h6.4' }),
        h('circle', { key: 'd', cx: 5.45, cy: 11.5, r: 1.55 }),
      ]);
    }

    function chevronDownIcon() {
      return icon(h('path', { d: 'M4.4 6.3 8 9.6l3.6-3.3' }));
    }

    function chevronUpIcon() {
      return icon(h('path', { d: 'M4.4 9.7 8 6.4l3.6 3.3' }));
    }

    function closeIcon() {
      return icon([h('path', { key: 'a', d: 'M4.2 4.2 11.8 11.8' }), h('path', { key: 'b', d: 'M11.8 4.2 4.2 11.8' })]);
    }

    function stopEvent(event) {
      event.stopPropagation();
    }

    function toDraft(settings) {
      return {
        salary: String(Math.round(settings.salary)),
        start: settings.start,
        end: settings.end,
        lunchStart: settings.lunchStart,
        lunchEnd: settings.lunchEnd,
      };
    }

    // ------------------------------------------------------------ component

    const RING_RADIUS = 21.5;
    const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

    function WorkPayNote(props) {
      const t = props.t;
      const locale = props.locale;

      const [settings, setSettings] = useState(
        () => normalizeSettings(loadStoredSettings()) || Object.assign({}, DEFAULT_SETTINGS),
      );
      const [now, setNow] = useState(() => new Date());
      const [pos, setPos] = useState(readPosition);
      const [collapsed, setCollapsed] = useState(() => read(COLLAPSED_KEY) === true);
      const [editing, setEditing] = useState(false);
      const [draft, setDraft] = useState(() => toDraft(settings));
      const [error, setError] = useState(false);
      const [dragging, setDragging] = useState(false);
      const [hasPhoto, setHasPhoto] = useState(false);
      const [photoRev, setPhotoRev] = useState('');
      const [photoBusy, setPhotoBusy] = useState(false);
      const [photoError, setPhotoError] = useState('');
      const [legacyPhoto, setLegacyPhoto] = useState(() => {
        const stored = read(PHOTO_KEY);
        return typeof stored === 'string' && stored ? stored : null;
      });
      const [photoTone, setPhotoTone] = useState('dark');
      const [photoKind, setPhotoKind] = useState(() => (legacyPhoto ? 'image' : 'none'));
      const [photoBrightness, setPhotoBrightness] = useState(() => {
        const stored = read(BRIGHTNESS_KEY);
        return typeof stored === 'number' && stored >= 0 && stored <= 100 ? stored : 60;
      });

      const rootRef = useRef(null);
      const dragRef = useRef(null);
      const posRef = useRef(pos);
      const fileRef = useRef(null);
      const [, bump] = useReducer((value) => value + 1, 0);

      useEffect(() => {
        posRef.current = pos;
      }, [pos]);

      useEffect(() => {
        const tick = () => setNow(new Date());
        const timer = window.setInterval(tick, 500);
        window.addEventListener('focus', tick);
        document.addEventListener('visibilitychange', tick);
        return () => {
          window.clearInterval(timer);
          window.removeEventListener('focus', tick);
          document.removeEventListener('visibilitychange', tick);
        };
      }, []);

      useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined;
        return locale.subscribe(() => bump());
      }, [locale]);

      useEffect(() => {
        let cancelled = false;
        const clearLegacy = () => {
          try {
            window.localStorage.removeItem(PHOTO_KEY);
          } catch (error) {
            /* legacy storage may be blocked; the file on disk is the source of truth */
          }
        };
        const migrateLegacy = async (legacy) => {
          try {
            const response = await fetch(PHOTO_ROUTE, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ dataUrl: legacy }),
            });
            const result = await response.json().catch(() => null);
            if (cancelled) return;
            if (result && result.ok === true) {
              setHasPhoto(true);
              setPhotoRev(String(result.version || Date.now()));
              setLegacyPhoto(null);
              setPhotoKind('image');
              clearLegacy();
            }
          } catch (error) {
            /* keep the legacy copy for a later attempt */
          }
        };
        const probe = async () => {
          try {
            const response = await fetch(PHOTO_ROUTE, { method: 'HEAD', cache: 'no-store' });
            if (cancelled) return;
            const type = response.headers.get('content-type') || '';
            const video = type.indexOf('video/') === 0;
            if (response.ok && (video || type.indexOf('image/') === 0)) {
              setHasPhoto(true);
              setPhotoKind(video ? 'video' : 'image');
              setLegacyPhoto(null);
              clearLegacy();
              return;
            }
            const legacy = read(PHOTO_KEY);
            if (typeof legacy === 'string' && legacy) await migrateLegacy(legacy);
          } catch (error) {
            if (!cancelled) setHasPhoto(false);
          }
        };
        probe();
        return () => {
          cancelled = true;
        };
      }, []);

      const sampleTone = (source) => {
        try {
          const size = 24;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext('2d');
          if (!context) return;
          context.drawImage(source, 0, 0, size, size);
          const data = context.getImageData(0, 0, size, size).data;
          let total = 0;
          let count = 0;
          for (let y = 0; y < Math.ceil(size * 0.6); y += 1) {
            for (let x = 0; x < size; x += 1) {
              const index = (y * size + x) * 4;
              total +=
                (0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2]) / 255;
              count += 1;
            }
          }
          setPhotoTone(count > 0 && total / count > 0.45 ? 'light' : 'dark');
        } catch (error) {
          setPhotoTone('dark');
        }
      };

      /*
       * Bright pictures get a white veil and dark ink; dark pictures keep the
       * dark scrim and cream ink. The top 60% decides, because the headline and
       * the amount sit there. A video samples its own first frame on load.
       */
      useEffect(() => {
        if (!hasPhoto && !legacyPhoto) {
          setPhotoTone('dark');
          return undefined;
        }
        if (photoKind === 'video') {
          setPhotoTone('dark');
          return undefined;
        }
        const url = hasPhoto ? PHOTO_ROUTE + (photoRev ? '?v=' + photoRev : '') : legacyPhoto;
        if (!url) return undefined;
        let cancelled = false;
        const image = new window.Image();
        image.onload = () => {
          if (!cancelled) sampleTone(image);
        };
        image.onerror = () => {
          if (!cancelled) setPhotoTone('dark');
        };
        image.src = url;
        return () => {
          cancelled = true;
        };
      }, [photoKind, hasPhoto, photoRev, legacyPhoto]);

      useEffect(() => {
        if (pos) return undefined;
        const element = rootRef.current;
        if (!element) return undefined;
        const rect = element.getBoundingClientRect();
        const next = clampPosition(
          window.innerWidth - rect.width - 24,
          window.innerHeight - rect.height - 88,
          rect.width,
          rect.height,
        );
        posRef.current = next;
        setPos(next);
        return undefined;
      }, [pos, collapsed, editing]);

      useEffect(() => {
        const element = rootRef.current;
        const current = posRef.current;
        if (!element || !current) return undefined;
        const rect = element.getBoundingClientRect();
        const next = clampPosition(current.x, current.y, rect.width, rect.height);
        if (next.x !== current.x || next.y !== current.y) {
          posRef.current = next;
          setPos(next);
          write(POS_KEY, next);
        }
        return undefined;
      }, [collapsed, editing]);

      useEffect(() => {
        const onResize = () => {
          const element = rootRef.current;
          const current = posRef.current;
          if (!element || !current) return;
          const rect = element.getBoundingClientRect();
          const next = clampPosition(current.x, current.y, rect.width, rect.height);
          posRef.current = next;
          setPos(next);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);

      const openSettings = () => {
        setDraft(toDraft(settings));
        setError(false);
        setEditing(true);
      };

      const cancelEdit = () => {
        setError(false);
        setEditing(false);
      };

      const saveDraft = () => {
        const next = normalizeSettings(draft);
        if (!next) {
          setError(true);
          return;
        }
        setSettings(next);
        saveSettings(next);
        setDraft(toDraft(next));
        setError(false);
        setEditing(false);
      };

      const updateDraft = (key, value) => {
        setDraft((previous) => Object.assign({}, previous, { [key]: value }));
      };

      const pickPhoto = () => {
        if (fileRef.current) fileRef.current.click();
      };

      const uploadPhoto = async (dataUrl, kind) => {
        setPhotoBusy(true);
        setPhotoError('');
        try {
          const response = await fetch(PHOTO_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ dataUrl }),
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result || result.ok !== true) throw new Error('upload failed');
          setHasPhoto(true);
          setPhotoKind(kind === 'video' ? 'video' : 'image');
          setPhotoRev(String(result.version || Date.now()));
          setLegacyPhoto(null);
          try {
            window.localStorage.removeItem(PHOTO_KEY);
          } catch (error) {
            /* ignore blocked storage */
          }
        } catch (error) {
          setPhotoError('save');
        } finally {
          setPhotoBusy(false);
        }
      };

      const removePhoto = async () => {
        setPhotoBusy(true);
        setPhotoError('');
        try {
          await fetch(PHOTO_ROUTE, { method: 'DELETE' });
        } catch (error) {
          /* the route may not exist yet; clearing the local copy still hides it */
        }
        setHasPhoto(false);
        setPhotoKind('none');
        setPhotoRev('');
        setLegacyPhoto(null);
        try {
          window.localStorage.removeItem(PHOTO_KEY);
        } catch (error) {
          /* ignore blocked storage */
        }
        setPhotoBusy(false);
      };

      const updateBrightness = (value) => {
        const next = Math.max(0, Math.min(100, Math.round(value)));
        setPhotoBrightness(next);
        write(BRIGHTNESS_KEY, next);
      };

      const onPhotoFile = (event) => {
        const input = event.target;
        const file = input.files && input.files[0];
        input.value = '';
        if (!file) return;
        const isImage = /^image\//.test(file.type);
        const isVideo = /^video\//.test(file.type);
        if (!isImage && !isVideo) return;
        if (file.size > 40 * 1024 * 1024) {
          setPhotoError('save');
          return;
        }
        if (isVideo && !document.createElement('video').canPlayType(file.type)) {
          setPhotoError('format');
          return;
        }
        const kind = isVideo ? 'video' : 'image';
        setPhotoBusy(true);
        setPhotoError('');
        const reader = new FileReader();
        reader.onerror = () => {
          setPhotoBusy(false);
          setPhotoError('save');
        };
        reader.onload = () => {
          const raw = typeof reader.result === 'string' ? reader.result : '';
          if (!raw) {
            setPhotoBusy(false);
            setPhotoError('save');
            return;
          }
          if (isVideo) {
            uploadPhoto(raw, 'video');
            return;
          }
          const image = new window.Image();
          image.onload = () => uploadPhoto(raw, 'image');
          image.onerror = () => {
            setPhotoBusy(false);
            setPhotoError('format');
          };
          image.src = raw;
        };
        reader.readAsDataURL(file);
      };

      const collapse = () => {
        setCollapsed(true);
        write(COLLAPSED_KEY, true);
      };

      const expand = () => {
        setCollapsed(false);
        write(COLLAPSED_KEY, false);
      };

      const onDragStart = (event) => {
        if (editing || event.button !== 0) return;
        const element = rootRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        dragRef.current = {
          dx: event.clientX - rect.left,
          dy: event.clientY - rect.top,
          width: rect.width,
          height: rect.height,
          moved: false,
        };
        setDragging(true);
        if (typeof event.currentTarget.setPointerCapture === 'function') {
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch (error) {
            /* pointer capture is a nicety, not a requirement */
          }
        }
      };

      const onDragMove = (event) => {
        const drag = dragRef.current;
        if (!drag) return;
        const next = clampPosition(
          event.clientX - drag.dx,
          event.clientY - drag.dy,
          drag.width,
          drag.height,
        );
        drag.moved = true;
        posRef.current = next;
        setPos(next);
      };

      const onDragEnd = () => {
        const drag = dragRef.current;
        if (!drag) return;
        dragRef.current = null;
        setDragging(false);
        if (drag.moved) write(POS_KEY, posRef.current);
      };

      const stats = computeStats(settings, now);
      const statusText = t('status.' + stats.status);
      const backgroundUrl = PHOTO_ROUTE + (photoRev ? '?v=' + photoRev : '');
      const photoActive = hasPhoto || Boolean(legacyPhoto);
      const photoSource = hasPhoto
        ? 'url("' + backgroundUrl + '")'
        : legacyPhoto
          ? 'url("' + legacyPhoto + '")'
          : 'none';
      const mediaUrl = hasPhoto ? backgroundUrl : legacyPhoto || '';
      const photoVeil = (100 - photoBrightness) / 100;
      const lunchText = stats.lunchMinutes > 0 ? t('lunch') + ' ' + formatDuration(stats.lunchMinutes) : '';
      const scheduleText = settings.start + '–' + settings.end + (lunchText ? ' · ' + lunchText : '');
      let remainText = '';
      if (stats.status === 'working' || stats.status === 'lunch') {
        remainText = t('toOffWork') + ' ' + formatDuration(stats.remaining);
      } else if (stats.status === 'before') {
        remainText = t('toStart') + ' ' + formatDuration(stats.remaining);
      } else if (stats.status === 'done') {
        remainText = t('doneToday');
      } else if (stats.status === 'weekend') {
        remainText = t('status.weekend');
      }

      const ring = h(
        'div',
        { className: 'wpn-ring' },
        h(
          'svg',
          { viewBox: '0 0 52 52', width: 52, height: 52, 'aria-hidden': 'true' },
          h('circle', {
            className: 'wpn-ring-track',
            cx: 26,
            cy: 26,
            r: RING_RADIUS,
            fill: 'none',
            strokeWidth: 2.6,
          }),
          h('circle', {
            className: 'wpn-ring-fill',
            cx: 26,
            cy: 26,
            r: RING_RADIUS,
            fill: 'none',
            strokeWidth: 2.6,
            strokeLinecap: 'round',
            strokeDasharray: RING_LENGTH.toFixed(2),
            strokeDashoffset: (RING_LENGTH * (1 - stats.dayProgress)).toFixed(2),
            transform: 'rotate(-90 26 26)',
          }),
        ),
        h('span', { className: 'wpn-ring-text' }, Math.round(stats.dayProgress * 100) + '%'),
      );

      const header = h(
        'div',
        {
          className: 'wpn-head',
          onPointerDown: editing ? undefined : onDragStart,
          style: editing ? { cursor: 'default' } : undefined,
        },
        h('span', { className: 'wpn-dot', 'data-status': stats.status, 'aria-hidden': 'true' }),
        h('span', { className: 'wpn-title' }, editing ? t('settings') : t('title')),
        !editing ? h('span', { className: 'wpn-status' }, statusText) : null,
        h(
          'div',
          { className: 'wpn-actions' },
          editing
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'wpn-icon-btn',
                  title: t('close'),
                  'aria-label': t('close'),
                  onPointerDown: stopEvent,
                  onClick: cancelEdit,
                },
                closeIcon(),
              )
            : h(
                'button',
                {
                  type: 'button',
                  className: 'wpn-icon-btn',
                  title: t('settings'),
                  'aria-label': t('settings'),
                  onPointerDown: stopEvent,
                  onClick: openSettings,
                },
                slidersIcon(),
              ),
          !editing
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'wpn-icon-btn',
                  title: t('collapse'),
                  'aria-label': t('collapse'),
                  onPointerDown: stopEvent,
                  onClick: collapse,
                },
                chevronDownIcon(),
              )
            : null,
        ),
      );

      const body = h(
        'div',
        { className: 'wpn-body' },
        h(
          'div',
          { className: 'wpn-panel' },
          h(
            'div',
            { className: 'wpn-hero' },
            h(
              'div',
              { className: 'wpn-hero-main' },
              h('div', { className: 'wpn-label' }, t('today')),
              h(
                'div',
                { className: 'wpn-amount' },
                h('span', { className: 'wpn-cur' }, '¥'),
                money(stats.todayPay),
              ),
            ),
            ring,
          ),
          h(
            'div',
            { className: 'wpn-hero-foot' },
            h('span', { className: 'wpn-sched' }, scheduleText),
            h('span', { className: 'wpn-remain' }, remainText),
          ),
          h(
            'div',
            { className: 'wpn-month-row' },
            h(
              'div',
              { className: 'wpn-stat' },
              h('span', { className: 'wpn-stat-label' }, t('monthTotal')),
              h(
                'span',
                { className: 'wpn-stat-value' },
                h('span', { className: 'wpn-cur' }, '¥'),
                money(stats.monthPay),
              ),
            ),
            h(
              'div',
              { className: 'wpn-stat is-right' },
              h('span', { className: 'wpn-stat-label' }, t('monthTarget')),
              h('span', { className: 'wpn-stat-muted' }, '¥' + Math.round(settings.salary).toLocaleString()),
            ),
          ),
          h(
            'div',
            { className: 'wpn-progress' },
            h(
              'div',
              { className: 'wpn-track' },
              h('div', {
                className: 'wpn-fill',
                style: { width: (stats.monthProgress * 100).toFixed(2) + '%' },
              }),
            ),
            h('span', { className: 'wpn-pct' }, Math.round(stats.monthProgress * 100) + '%'),
          ),
        ),
      );

      const form = h(
        'div',
        { className: 'wpn-form' },
        h(
          'div',
          { className: 'wpn-field' },
          h('span', { className: 'wpn-field-label' }, t('salary')),
          h('input', {
            className: 'wpn-input',
            type: 'number',
            min: '0',
            step: '500',
            inputMode: 'decimal',
            value: draft.salary,
            onChange: (event) => updateDraft('salary', event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'wpn-field' },
          h('span', { className: 'wpn-field-label' }, t('workHours')),
          h(
            'div',
            { className: 'wpn-times' },
            h('input', {
              className: 'wpn-input',
              type: 'time',
              value: draft.start,
              onChange: (event) => updateDraft('start', event.target.value),
            }),
            h('span', { className: 'wpn-tilde' }, '–'),
            h('input', {
              className: 'wpn-input',
              type: 'time',
              value: draft.end,
              onChange: (event) => updateDraft('end', event.target.value),
            }),
          ),
        ),
        h(
          'div',
          { className: 'wpn-field' },
          h('span', { className: 'wpn-field-label' }, t('lunch')),
          h(
            'div',
            { className: 'wpn-times' },
            h('input', {
              className: 'wpn-input',
              type: 'time',
              value: draft.lunchStart,
              onChange: (event) => updateDraft('lunchStart', event.target.value),
            }),
            h('span', { className: 'wpn-tilde' }, '–'),
            h('input', {
              className: 'wpn-input',
              type: 'time',
              value: draft.lunchEnd,
              onChange: (event) => updateDraft('lunchEnd', event.target.value),
            }),
          ),
        ),
        h(
          'div',
          { className: 'wpn-field' },
          h('span', { className: 'wpn-field-label' }, t('photo')),
          h(
            'div',
            { className: 'wpn-photo-ctl' },
            photoActive
              ? h('span', {
                  className: 'wpn-thumb',
                  style: { backgroundImage: photoSource },
                  'aria-hidden': 'true',
                })
              : null,
            h(
              'button',
              { type: 'button', className: 'wpn-mini', onClick: pickPhoto, disabled: photoBusy },
              photoActive ? t('changePhoto') : t('choosePhoto'),
            ),
            photoActive
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'wpn-mini is-quiet',
                    onClick: removePhoto,
                    disabled: photoBusy,
                  },
                  t('removePhoto'),
                )
              : null,
          ),
        ),
        photoActive
          ? h(
              'div',
              { className: 'wpn-field' },
              h('span', { className: 'wpn-field-label' }, t('photoBrightness')),
              h(
                'div',
                { className: 'wpn-range-wrap' },
                h('input', {
                  className: 'wpn-range',
                  type: 'range',
                  min: '0',
                  max: '100',
                  step: '5',
                  value: String(photoBrightness),
                  onChange: (event) => updateBrightness(Number(event.target.value)),
                }),
                h('span', { className: 'wpn-range-value' }, photoBrightness + '%'),
              ),
            )
          : null,
        h('input', {
          ref: fileRef,
          type: 'file',
          accept: 'image/*,video/*',
          style: { display: 'none' },
          onChange: onPhotoFile,
        }),
        h('div', { className: 'wpn-hint' }, t('lunchHint')),
        h('div', { className: 'wpn-hint' }, t('calcHint')),
        photoError
          ? h(
              'div',
              { className: 'wpn-error', role: 'alert' },
              t(photoError === 'format' ? 'photoFormatError' : 'photoError'),
            )
          : null,
        error ? h('div', { className: 'wpn-error', role: 'alert' }, t('invalid')) : null,
        h(
          'div',
          { className: 'wpn-form-actions' },
          h(
            'button',
            { type: 'button', className: 'wpn-btn is-ghost', onClick: cancelEdit },
            t('cancel'),
          ),
          h(
            'button',
            { type: 'button', className: 'wpn-btn is-primary', onClick: saveDraft },
            t('save'),
          ),
        ),
      );

      const pill = h(
        'div',
        {
          className: 'wpn-pill' + (photoActive ? ' has-photo' : '') + (photoTone === 'light' ? ' is-light' : ''),
          style: { '--wpn-photo': photoSource, '--wpn-photo-veil': String(photoVeil) },
          role: 'button',
          tabIndex: 0,
          title: t('expand'),
          'aria-label': t('expand'),
          onClick: expand,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              expand();
            }
          },
        },
        h('span', { className: 'wpn-dot', 'data-status': stats.status, 'aria-hidden': 'true' }),
        h('span', { className: 'wpn-pill-amount' }, '¥' + money(stats.todayPay)),
        h('span', { className: 'wpn-pill-label' }, t('today')),
        h('span', { className: 'wpn-pill-divider', 'aria-hidden': 'true' }),
        h('span', { className: 'wpn-pill-month' }, t('monthTotal') + ' ¥' + money(stats.monthPay)),
        chevronUpIcon(),
      );

      const mediaLayers =
        photoKind === 'video' && mediaUrl
          ? [
              h('video', {
                key: 'photo',
                className: 'wpn-photo-video',
                src: mediaUrl,
                autoPlay: true,
                muted: true,
                loop: true,
                playsInline: true,
                'aria-hidden': 'true',
                onLoadedData: (event) => sampleTone(event.currentTarget),
                onCanPlay: (event) => {
                  const video = event.currentTarget;
                  const result = video.play();
                  if (result && typeof result.catch === 'function') result.catch(() => {});
                },
                onError: () => setPhotoTone('dark'),
              }),
              h('div', { key: 'veil', className: 'wpn-photo-veil', 'aria-hidden': 'true' }),
            ]
          : null;

      const content = collapsed
        ? pill
        : h(
            'div',
            {
              className:
                'wpn-card' +
                (editing ? ' is-editing' : '') +
                (photoActive ? ' has-photo' : '') +
                (photoTone === 'light' ? ' is-light' : '') +
                (photoKind === 'video' ? ' is-video' : ''),
              style: {
                '--wpn-photo': photoSource,
                '--wpn-photo-veil': String(photoVeil),
                backgroundImage: photoKind === 'video' ? 'none' : undefined,
              },
            },
            mediaLayers,
            header,
            editing ? form : body,
          );

      return h(
        'div',
        {
          ref: rootRef,
          className: 'wpn-root' + (dragging ? ' is-dragging' : ''),
          style: pos
            ? { left: Math.round(pos.x) + 'px', top: Math.round(pos.y) + 'px' }
            : { right: '24px', bottom: '88px' },
          onPointerMove: onDragMove,
          onPointerUp: onDragEnd,
          onPointerCancel: onDragEnd,
        },
        content,
      );
    }

    // ------------------------------------------------------------- plugin

    function installStyles(css) {
      const tag = document.createElement('style');
      tag.setAttribute('data-work-pay-note', '');
      tag.textContent = css;
      document.head.appendChild(tag);
      return () => {
        if (tag.parentNode) tag.parentNode.removeChild(tag);
      };
    }

    const name = 'work-pay-note';
    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(() => installStyles(CSS), 'work-pay-note: styles');
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'work-pay-note: dictionaries');
      const t = ctx.locale.bind(NS);

      ctx.slots.inject('shell.overlay', function* registerNote() {
        yield ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'work-pay-note',
            order: 45,
            label: () => t('title'),
          },
          () => h(WorkPayNote, { t, locale: ctx.locale }),
        );
      });
    }

    module.exports = { name, inject, apply };
    return module.exports;
  },
});
