-- ===================================
-- SEED DATA FOR CRYPT_PORT DATABASE
-- Target: Reach INITIAL_DEPOSIT of 9,500 USDT
-- Current: 6,000 USDT on platforms (Binance 3,000 + Bybit 3,000)
-- Need: ~3,500 USDT in neo-banks
-- ===================================

\c crypt_port;

-- ===================================
-- 1. Insert Physical Banks
-- ===================================
INSERT INTO banks (created_at, updated_at, deleted_at, name, code)
VALUES 
  (NOW(), NOW(), NULL, 'Banco Galicia', 'GALICIA'),
  (NOW(), NOW(), NULL, 'Banco Nación', 'NACION'),
  (NOW(), NOW(), NULL, 'BBVA', 'BBVA'),
  (NOW(), NOW(), NULL, 'Santander', 'SANTANDER');

-- ===================================
-- 2. Insert Drops (for bank accounts)
-- ===================================
INSERT INTO drops (created_at, updated_at, deleted_at, name, comment, status)
VALUES 
  (NOW(), NOW(), NULL, 'Drop 1', 'Main drop for bank accounts', 'active');

-- ===================================
-- 3. Insert Neo-Banks (without drops - only platform_id)
-- ===================================
INSERT INTO drop_neo_banks (
  created_at,
  updated_at,
  deleted_at,
  provider,
  account_id,
  comment,
  current_balance,
  status,
  platform_id,
  exchange_rate,
  usdt_equivalent
) VALUES
  -- Platform 1 (Binance) Neo-Banks
  (NOW(), NOW(), NULL, 'ripio'::drop_neo_banks_provider_enum, 
   '1122334455667788', 'BINANCE.RIPIO.1', 1100000.00, 'active'::drop_neo_banks_status_enum, 1, 1100.00, 1000.0000),
  
  (NOW(), NOW(), NULL, 'lemon_cash'::drop_neo_banks_provider_enum, 
   '2233445566778899', 'BINANCE.LEMON.1', 550000.00, 'active'::drop_neo_banks_status_enum, 1, 1100.00, 500.0000),
  
  -- Platform 2 (Bybit) Neo-Banks  
  (NOW(), NOW(), NULL, 'satoshi_tango'::drop_neo_banks_provider_enum, 
   '3344556677889900', 'BYBIT.SATOSHI.1', 1150000.00, 'active'::drop_neo_banks_status_enum, 2, 1150.00, 1000.0000),
  
  (NOW(), NOW(), NULL, 'yont'::drop_neo_banks_provider_enum, 
   '4455667788990011', 'BYBIT.YONT.1', 1150000.00, 'active'::drop_neo_banks_status_enum, 2, 1150.00, 1000.0000);

-- ===================================
-- 4. Insert Bank Accounts (linked to drops and banks)
-- ===================================
INSERT INTO bank_accounts (
  created_at,
  updated_at,
  deleted_at,
  cbu,
  alias,
  status,
  limit_amount,
  bank_id,
  drop_id
)
SELECT 
  NOW(), NOW(), NULL,
  '0000003100' || LPAD(b.id::TEXT, 10, '0') || '1',
  'DROP1.' || b.code || '.1',
  'working'::bank_accounts_status_enum,
  5000000.00,
  b.id,
  1
FROM banks b
WHERE b.id <= 4;

INSERT INTO bank_accounts (
  created_at,
  updated_at,
  deleted_at,
  cbu,
  alias,
  status,
  limit_amount,
  bank_id,
  drop_id
)
SELECT 
  NOW(), NOW(), NULL,
  '0000003100' || LPAD(b.id::TEXT, 10, '0') || '2',
  'DROP1.' || b.code || '.2',
  'working'::bank_accounts_status_enum,
  5000000.00,
  b.id,
  1
FROM banks b
WHERE b.id <= 4;

-- ===================================
-- Verification Queries
-- ===================================
\echo '===================='
\echo 'Neo Banks:'
\echo '===================='
SELECT 
  comment
  provider,
  alias,
  current_balance,
  exchange_rate,
  usdt_equivalent,
  platform_id,
  drop_id
FROM drop_neo_banks;

\echo ''
\echo '===================='
\echo 'Physical Banks:'
\echo '===================='
SELECT id, name, code FROM banks;

\echo ''
\echo '===================='
\echo 'Bank Accounts:'
\echo '===================='
SELECT 
  id,
  alias,
  cbu,
  bank_id,
  drop_id,
  status,
  limit_amount
FROM bank_accounts;

\echo ''
\echo '===================='
\echo 'Drops:'
\echo '===================='
SELECT id, name, comment, status FROM drops;

\echo ''
\echo '===================='
\echo 'Working Deposit Calculation:'
\echo '===================='
SELECT 
  COALESCE((SELECT SUM(balance) FROM platforms), 0) as platform_balance_usdt,
  COALESCE((SELECT SUM(usdt_equivalent) FROM drop_neo_banks), 0) as neobanks_usdt,
  COALESCE((SELECT SUM(balance) FROM platforms), 0) + 
  COALESCE((SELECT SUM(usdt_equivalent) FROM drop_neo_banks), 0) as total_working_deposit,
  (SELECT value FROM system_settings WHERE key = 'INITIAL_DEPOSIT') as target_initial_deposit;
