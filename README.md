# Bulls and Cows

Игра «Быки и коровы» на TypeScript: четыре системы счисления, история попыток и локальная таблица рекордов.

## Запуск

```bash
npm ci
npm run build
python3 -m http.server 4173 --directory dist
```

Откройте `http://localhost:4173`. Для проверки кода доступны `npm test`, `npm run lint` и `npm run format:check`.

## Структура

- `src/game/` — чистая игровая логика и тесты Vitest.
- `src/main.ts` — интерфейс, таймер и `localStorage`.
- `src/style.css` — адаптивное оформление.
- [DESIGN.md](./DESIGN.md) — структуры данных, алгоритмы, сложность и принципы чистого кода.

Ветка `bulls-and-cows` содержит отдельные пары коммитов «падающие тесты → реализация» для всех пяти обязательных функций. `main` остаётся исходной веткой с одним README.
