export interface ReserveProfitRequest {
  date?: string;
}

export interface ReserveProfitResponse {
  date: string;
  workingDepositUsdt: number;
  initialDepositUsdt: number;
  deltaUsdt: number;
  reservedProfitUsdt: number;
  deficitUsdt: number;
}
