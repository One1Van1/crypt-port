-- Создаём физические банки
INSERT INTO banks (name, code) VALUES
  ('Banco Galicia', 'GALICIA'),
  ('Banco Nación', 'NACION'),
  ('BBVA', 'BBVA'),
  ('Santander', 'SANTANDER')
ON CONFLICT DO NOTHING;

-- Создаём drop для привязки нео-банков
INSERT INTO drops (name, description) VALUES
  ('Main Drop', 'Основной дроп для нео-банков')
ON CONFLICT DO NOTHING;

-- Создаём нео-банки с распределением по платформам
-- Платформа 1 (Binance, курс 1100): ~1,750 USDT
-- Платформа 2 (Bybit, курс 1150): ~1,750 USDT
WITH drop_id AS (SELECT id FROM drops LIMIT 1)
INSERT INTO drop_neo_banks (provider, account_id, drop_id, current_balance, status, platform_id, exchange_rate, usdt_equivalent, comment) 
SELECT * FROM (VALUES
  -- Платформа 1 (Binance, курс 1100)
  ('MERCADO_PAGO', 'MP-001', (SELECT id FROM drop_id), 1100000.00, 'ACTIVE', 1, 1100.00, 1000.0000, 'Нео-банк Mercado Pago'),
  ('UALA', 'UA-001', (SELECT id FROM drop_id), 825000.00, 'ACTIVE', 1, 1100.00, 750.0000, 'Нео-банк Ualá'),
  
  -- Платформа 2 (Bybit, курс 1150)
  ('NARANJA_X', 'NX-001', (SELECT id FROM drop_id), 1150000.00, 'ACTIVE', 2, 1150.00, 1000.0000, 'Нео-банк Naranja X'),
  ('PERSONAL_PAY', 'PP-001', (SELECT id FROM drop_id), 862500.00, 'ACTIVE', 2, 1150.00, 750.0000, 'Нео-банк Personal Pay')
) AS t(provider, account_id, drop_id, current_balance, status, platform_id, exchange_rate, usdt_equivalent, comment);

-- Создаём физические банковские счета
INSERT INTO bank_accounts (bank_id, platform_id, alias, account_number, current_balance, status)
SELECT 
  b.id as bank_id,
  p.id as platform_id,
  b.name || ' - ' || p.name as alias,
  LPAD((b.id * 100000 + p.id * 10000 + FLOOR(RANDOM() * 10000))::text, 16, '0') as account_number,
  0.00 as current_balance,
  'ACTIVE' as status
FROM banks b
CROSS JOIN platforms p
LIMIT 8;

-- Проверяем результат
SELECT 
  'Neo Banks' as type,
  COUNT(*) as count,
  ROUND(SUM(usdt_equivalent), 2) as total_usdt
FROM drop_neo_banks
UNION ALL
SELECT 
  'Physical Banks' as type,
  COUNT(*) as count,
  NULL as total_usdt
FROM banks
UNION ALL
SELECT 
  'Bank Accounts' as type,
  COUNT(*) as count,
  NULL as total_usdt
FROM bank_accounts;

-- Итоговый баланс рабочего депозита
SELECT 
  'На платформах (USDT)' as location,
  ROUND(SUM(balance), 2) as amount
FROM platforms
UNION ALL
SELECT 
  'В нео-банках (USDT)' as location,
  ROUND(COALESCE(SUM(usdt_equivalent), 0), 2) as amount
FROM drop_neo_banks
UNION ALL
SELECT 
  '─────────────────────' as location,
  NULL as amount
UNION ALL
SELECT 
  'ИТОГО Рабочий депозит' as location,
  ROUND((SELECT SUM(balance) FROM platforms) + (SELECT COALESCE(SUM(usdt_equivalent), 0) FROM drop_neo_banks), 2) as amount
UNION ALL
SELECT 
  'Целевой депозит' as location,
  (SELECT CAST(value AS NUMERIC) FROM system_settings WHERE key = 'INITIAL_DEPOSIT') as amount;
