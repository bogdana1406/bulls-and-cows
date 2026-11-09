import { countPossibleSecrets } from './game/countPossibleSecrets.js';
import { createDigitValidator } from './game/createDigitValidator.js';
import { isValidGuess } from './game/isValidGuess.js';
import {
  rankRecords,
  recordFromRound,
  startRound,
  submitGuess,
  type RecordEntry,
  type RoundSettings,
  type RoundState,
} from './game/round.js';
import type { Base } from './game/types.js';

const STORAGE_KEY = 'bulls-and-cows.records.v1';
const BASES: readonly { value: Base; label: string; alphabet: string }[] = [
  { value: 2, label: 'BIN · Двоичная', alphabet: '0–1' },
  { value: 8, label: 'OCT · Восьмеричная', alphabet: '0–7' },
  { value: 10, label: 'DEC · Десятичная', alphabet: '0–9' },
  { value: 16, label: 'HEX · Шестнадцатеричная', alphabet: '0–9, A–F' },
];

let settings: RoundSettings = { length: 4, base: 10 };
let round: RoundState | null = null;
let records = loadRecords();
let timerNode: HTMLElement | null = null;

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function baseLabel(base: Base): string {
  return BASES.find((item) => item.value === base)?.label ?? String(base);
}

function digitsLabel(count: number): string {
  return `${count} ${count <= 4 ? 'цифры' : 'цифр'}`;
}

function plural(count: number, one: string, few: string, many: string): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} ${many}`;
  const last = count % 10;
  return `${count} ${last === 1 ? one : last >= 2 && last <= 4 ? few : many}`;
}

function bullsLabel(count: number): string {
  return plural(count, 'бык', 'быка', 'быков');
}

function cowsLabel(count: number): string {
  return plural(count, 'корова', 'коровы', 'коров');
}

function isRecordEntry(value: unknown): value is RecordEntry {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    BASES.some((base) => base.value === item.base) &&
    typeof item.length === 'number' &&
    Number.isInteger(item.length) &&
    item.length >= 2 &&
    item.length <= 6 &&
    item.length <= (item.base as number) &&
    typeof item.attempts === 'number' &&
    Number.isInteger(item.attempts) &&
    item.attempts > 0 &&
    typeof item.durationMs === 'number' &&
    Number.isFinite(item.durationMs) &&
    item.durationMs >= 0 &&
    typeof item.achievedAt === 'number' &&
    Number.isFinite(item.achievedAt)
  );
}

function loadRecords(): RecordEntry[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    );
    return Array.isArray(stored)
      ? stored.filter(isRecordEntry).slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

function saveRecords(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // The current round still works when browser storage is unavailable.
  }
}

function createButton(label: string, className: string): HTMLButtonElement {
  const button = element('button', className, label);
  button.type = 'button';
  return button;
}

function createSettingsControls(locked: boolean): HTMLElement {
  const controls = element('div', 'settings-grid');

  const baseField = element('label', 'field');
  baseField.append(element('span', 'field-label', 'Система счисления'));
  const baseSelect = element('select', 'select');
  baseSelect.name = 'base';
  baseSelect.disabled = locked;
  BASES.forEach(({ value, label }) => {
    const option = element('option', '', label);
    option.value = String(value);
    option.selected = settings.base === value;
    baseSelect.append(option);
  });
  baseSelect.addEventListener('change', () => {
    const base = Number(baseSelect.value) as Base;
    settings = { base, length: Math.min(settings.length, base) };
    render();
  });
  baseField.append(baseSelect);

  const lengthField = element('label', 'field');
  lengthField.append(element('span', 'field-label', 'Длина числа'));
  const lengthSelect = element('select', 'select');
  lengthSelect.name = 'length';
  lengthSelect.disabled = locked;
  for (let length = 2; length <= 6; length += 1) {
    const option = element('option', '', digitsLabel(length));
    option.value = String(length);
    option.disabled = length > settings.base;
    option.selected = settings.length === length;
    lengthSelect.append(option);
  }
  lengthSelect.addEventListener('change', () => {
    settings = { ...settings, length: Number(lengthSelect.value) };
    render();
  });
  lengthField.append(lengthSelect);

  controls.append(baseField, lengthField);
  return controls;
}

function renderSetup(): HTMLElement {
  const panel = element('section', 'panel game-panel');
  panel.append(
    element('p', 'eyebrow', '01 / ПОДГОТОВКА'),
    element('h1', 'main-title', 'Разгадай секретный код.'),
    element(
      'p',
      'description',
      'Выбери длину и систему счисления. Все цифры в коде уникальны, а ноль может стоять первым.',
    ),
    createSettingsControls(false),
  );

  const info = element('div', 'hint-card');
  const baseInfo = BASES.find((item) => item.value === settings.base);
  info.append(
    element('span', 'hint-icon', '✦'),
    element(
      'p',
      '',
      `Доступные цифры: ${baseInfo?.alphabet}. Возможных кодов: ${countPossibleSecrets(settings.length, settings.base).toLocaleString('ru-RU')}.`,
    ),
  );
  panel.append(info);

  const start = createButton('Начать игру →', 'button button-primary');
  start.addEventListener('click', () => {
    round = startRound(settings, Date.now());
    render();
  });
  panel.append(start);
  return panel;
}

function renderHistory(current: RoundState): HTMLElement {
  const section = element('section', 'history-section');
  const heading = element('div', 'section-heading');
  heading.append(
    element('h2', '', 'История попыток'),
    element('span', 'count-badge', String(current.history.length)),
  );
  section.append(heading);
  if (current.history.length === 0) {
    section.append(
      element('p', 'empty-state', 'Здесь появятся твои попытки и подсказки.'),
    );
    return section;
  }

  const list = element('ol', 'history-list');
  current.history.forEach((entry, index) => {
    const row = element('li', 'history-row');
    row.append(
      element('span', 'row-number', String(index + 1).padStart(2, '0')),
      element('strong', 'guess-code', entry.guess.toUpperCase()),
      element('span', 'result-pill bulls', bullsLabel(entry.bulls)),
      element('span', 'result-pill cows', cowsLabel(entry.cows)),
    );
    list.append(row);
  });
  section.append(list);
  return section;
}

function renderRound(current: RoundState): HTMLElement {
  const panel = element('section', 'panel game-panel');
  const won = current.status === 'won';
  panel.append(
    element('p', 'eyebrow', won ? '03 / КОД ВЗЛОМАН' : '02 / РАУНД ИДЁТ'),
    element('h1', 'main-title', won ? 'Точное попадание!' : 'Разгадай код.'),
    element(
      'p',
      'description',
      won
        ? `Секретный код ${current.secret.toUpperCase()} найден за ${plural(current.history.length, 'попытку', 'попытки', 'попыток')}.`
        : 'Бык — цифра на своём месте. Корова — цифра есть в коде, но стоит в другом месте.',
    ),
    createSettingsControls(true),
  );

  const statusBar = element('div', 'status-bar');
  const timer = element(
    'strong',
    'timer',
    formatDuration((current.finishedAt ?? Date.now()) - current.startedAt),
  );
  timerNode = won ? null : timer;
  statusBar.append(
    element('span', '', won ? 'Время решения' : 'Время в игре'),
    timer,
    element('span', 'status-attempts', `Попыток: ${current.history.length}`),
  );
  panel.append(statusBar);

  if (!won) {
    const form = element('form', 'guess-form');
    const label = element('label', 'field');
    label.htmlFor = 'guess';
    label.append(element('span', 'field-label', 'Твоя попытка'));
    const input = element('input', 'guess-input');
    input.id = 'guess';
    input.name = 'guess';
    input.type = 'text';
    input.required = true;
    input.maxLength = current.settings.length;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = '0'.repeat(current.settings.length);
    input.setAttribute('aria-describedby', 'guess-feedback');
    const feedback = element('p', 'feedback', 'Цифры не должны повторяться.');
    feedback.id = 'guess-feedback';
    const isDigit = createDigitValidator(current.settings.base);
    input.addEventListener('input', () => {
      const filtered = [...input.value]
        .filter(isDigit)
        .slice(0, current.settings.length)
        .join('');
      if (input.value !== filtered) input.value = filtered;
      feedback.textContent = 'Цифры не должны повторяться.';
    });
    label.append(input);
    const submit = element(
      'button',
      'button button-primary',
      'Проверить код →',
    );
    submit.type = 'submit';
    form.append(label, submit, feedback);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const guess = input.value;
      if (
        !isValidGuess(guess, current.settings.length, current.settings.base)
      ) {
        feedback.textContent = 'Проверь длину, цифры и повторы.';
        return;
      }
      const next = submitGuess(current, guess, Date.now());
      if (next === current) {
        feedback.textContent = 'Эту попытку ты уже проверял.';
        return;
      }
      round = next;
      const record = recordFromRound(next);
      if (record) {
        records = rankRecords(records, record);
        saveRecords();
      }
      render();
      document.querySelector<HTMLInputElement>('#guess')?.focus();
    });
    panel.append(form);
  } else {
    const winCard = element('div', 'win-card');
    winCard.append(
      element('span', 'win-icon', '✓'),
      element('p', '', 'Результат появился в таблице рекордов.'),
    );
    panel.append(winCard);
  }

  panel.append(renderHistory(current));
  const newGame = createButton('Новая игра', 'button button-secondary');
  newGame.addEventListener('click', () => {
    round = null;
    timerNode = null;
    render();
  });
  panel.append(newGame);
  return panel;
}

function renderRecords(): HTMLElement {
  const panel = element('aside', 'panel records-panel');
  panel.append(
    element('p', 'eyebrow', 'ТАБЛИЦА ЛИДЕРОВ'),
    element('h2', 'records-title', 'Лучшие результаты'),
    element(
      'p',
      'records-description',
      'Меньше попыток — выше место. При равенстве решает время.',
    ),
  );
  if (records.length === 0) {
    panel.append(
      element(
        'p',
        'empty-records',
        'Пока здесь пусто. Первый взломанный код откроет таблицу.',
      ),
    );
    return panel;
  }
  const list = element('ol', 'records-list');
  records.forEach((record, index) => {
    const row = element('li', 'record-row');
    const meta = element('div', 'record-meta');
    meta.append(
      element(
        'strong',
        '',
        plural(record.attempts, 'попытка', 'попытки', 'попыток'),
      ),
      element(
        'span',
        '',
        `${digitsLabel(record.length)} · ${baseLabel(record.base)}`,
      ),
    );
    row.append(
      element('span', 'record-rank', String(index + 1).padStart(2, '0')),
      meta,
      element('span', 'record-time', formatDuration(record.durationMs)),
    );
    list.append(row);
  });
  panel.append(list);
  return panel;
}

function render(): void {
  timerNode = null;
  const shell = element('div', 'shell');
  const header = element('header', 'site-header');
  const brand = element('div', 'brand');
  brand.append(
    element('span', 'brand-mark', 'B·C'),
    element('span', 'brand-name', 'БЫКИ И КОРОВЫ'),
  );
  header.append(
    brand,
    element('span', 'header-note', 'Игра для тех, кто любит думать'),
  );
  const layout = element('main', 'layout');
  layout.append(round ? renderRound(round) : renderSetup(), renderRecords());
  const footer = element(
    'footer',
    'site-footer',
    'Логика, внимание и немного удачи.',
  );
  shell.append(header, layout, footer);
  document.body.replaceChildren(shell);
}

render();
window.setInterval(() => {
  if (round?.status === 'playing' && timerNode) {
    timerNode.textContent = formatDuration(Date.now() - round.startedAt);
  }
}, 1000);
