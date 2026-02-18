export interface UnlockSettings {
  id: string;
  unlock_interval_days: number;
  contents_per_unlock: number;
  updated_at: string;
}

export interface UnlockResult {
  totalContents: number;
  unlockedCount: number;
  nextUnlockDate: Date | null;
  isUnlocked: (releaseOrder: number) => boolean;
}

export function calculateUnlock(
  subscriptionStartDate: Date,
  settings: UnlockSettings,
  totalContents: number = 0
): UnlockResult {
  const now = new Date();
  const diffMs = now.getTime() - subscriptionStartDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const intervals = Math.floor(diffDays / settings.unlock_interval_days);
  const unlockedCount = (intervals + 1) * settings.contents_per_unlock; // +1: 첫 콘텐츠 즉시 해금

  // 다음 해금 날짜 계산
  const nextInterval = intervals + 1;
  const nextUnlockMs = subscriptionStartDate.getTime() + nextInterval * settings.unlock_interval_days * 24 * 60 * 60 * 1000;
  const nextUnlockDate = unlockedCount >= totalContents ? null : new Date(nextUnlockMs);

  return {
    totalContents,
    unlockedCount,
    nextUnlockDate,
    isUnlocked: (releaseOrder: number) => releaseOrder <= unlockedCount,
  };
}

export function getDaysUntilUnlock(
  releaseOrder: number,
  subscriptionStartDate: Date,
  settings: UnlockSettings
): number {
  // releaseOrder번째 콘텐츠가 해금되려면 몇 일 남았나
  const intervalsNeeded = Math.ceil(releaseOrder / settings.contents_per_unlock) - 1;
  const unlockDate = new Date(
    subscriptionStartDate.getTime() + intervalsNeeded * settings.unlock_interval_days * 24 * 60 * 60 * 1000
  );
  const now = new Date();
  const diff = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
