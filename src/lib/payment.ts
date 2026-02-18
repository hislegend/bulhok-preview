// 결제 모듈 - Coming Soon (껍데기)
// 실제 PG 연동 없이 UI만 제공

export const SUBSCRIPTION_PRICE = 250000; // 월 250,000원
export const SUBSCRIPTION_LABEL = '월 250,000원';

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}
