const PROVIDER_BADGE_CLASSES = {
  ripio: 'badge-ripio',
  lemon_cash: 'badge-lemon',
  satoshi_tango: 'badge-satoshi',
  yont: 'badge-yont',
} as const;

const PROVIDER_BADGE_PALETTE = [
  'badge-ripio',
  'badge-lemon',
  'badge-satoshi',
  'badge-yont',
] as const;

const stableStringHash = (value: string): number => {
  // djb2 xor (fast, deterministic)
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return (hash >>> 0);
};

export const getProviderBadgeClass = (provider: string | null | undefined): string => {
  const key = (provider ?? '').trim();
  if (!key) return PROVIDER_BADGE_PALETTE[0];

  const normalized = key.toLowerCase();

  const direct = (PROVIDER_BADGE_CLASSES as Record<string, string>)[normalized];
  if (direct) return direct;

  const hash = stableStringHash(normalized);
  return PROVIDER_BADGE_PALETTE[hash % PROVIDER_BADGE_PALETTE.length];
};
