const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'crypt_port',
});

async function check() {
  await AppDataSource.initialize();
  
  const result = await AppDataSource.query(`
    SELECT 
      cw.id as withdrawal_id,
      cw.amount_pesos,
      cw.status as withdrawal_status,
      pc.id as conversion_id,
      pc.usdt_amount,
      pc.exchange_rate
    FROM cash_withdrawals cw
    LEFT JOIN peso_to_usdt_conversions pc ON pc.cash_withdrawal_id = cw.id
    WHERE cw.id = 3
  `);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  await AppDataSource.destroy();
}

check().catch(console.error);
