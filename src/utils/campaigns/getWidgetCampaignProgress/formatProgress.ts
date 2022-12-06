const UC_PROGRESS_1 = { max: 25, value: 12.5 as const }; //  0%  - 24.99%
const UC_PROGRESS_2 = { max: 50, value: 37.5 as const }; //  25% - 49.99%
const UC_PROGRESS_3 = { max: 75, value: 62.5 as const }; //  50% - 74.99%
const UC_PROGRESS_4 = { max: 100, value: 87.5 as const }; // 75% - 100%

export const formatUseCaseProgress = (
  progress?: number
): 12.5 | 37.5 | 62.5 | 87.5 | 100 => {
  if (!progress) {
    return UC_PROGRESS_1.value;
  }

  if (progress < UC_PROGRESS_1.max) return UC_PROGRESS_1.value;
  else if (progress < UC_PROGRESS_2.max) return UC_PROGRESS_2.value;
  else if (progress < UC_PROGRESS_3.max) return UC_PROGRESS_3.value;
  else return UC_PROGRESS_4.value;
};
