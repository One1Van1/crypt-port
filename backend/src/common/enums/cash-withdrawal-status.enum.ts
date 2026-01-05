export enum CashWithdrawalStatus {
  PENDING = 'pending', // Забрал деньги, еще не отправил в конвертацию
  AWAITING_CONFIRMATION = 'awaiting_confirmation', // Отправил в конвертацию, ждёт подтверждения админа
  CONVERTED = 'converted', // Админ подтвердил конвертацию
}
