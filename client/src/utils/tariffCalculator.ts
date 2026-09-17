import type { TariffConfig, FeeBreakdown } from '../types/parking';

/**
 * Calculates tiered parking fees based on duration and tariff rates in Indian Rupees (₹).
 * Part-hours round UP using Math.ceil(durationMinutes / 60).
 * Base rate applies to first hour, subsequent rate applies to remaining hours up to daily cap.
 */
export function calculateParkingFee(
  entryTimeStr: string,
  exitTimeStr: string,
  config: TariffConfig
): FeeBreakdown {
  const entry = new Date(entryTimeStr).getTime();
  const exit = new Date(exitTimeStr).getTime();
  
  const durationMs = Math.max(0, exit - entry);
  const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60)));
  const billableHours = Math.ceil(durationMinutes / 60);

  const fullDays = Math.floor(billableHours / 24);
  const remainingHours = billableHours % 24;

  let firstHourFee = 0;
  let subsequentHoursCount = 0;
  let subsequentHoursFee = 0;
  let partialDayUncapped = 0;

  if (remainingHours > 0) {
    firstHourFee = config.firstHourRate;
    subsequentHoursCount = remainingHours - 1;
    subsequentHoursFee = subsequentHoursCount * config.subsequentHourRate;
    partialDayUncapped = firstHourFee + subsequentHoursFee;
  }

  const partialDayCapped = remainingHours > 0 ? Math.min(partialDayUncapped, config.dailyCap) : 0;
  const uncappedFee = (fullDays * config.dailyCap) + partialDayUncapped;
  const totalFee = (fullDays * config.dailyCap) + partialDayCapped;
  const capAdjustment = uncappedFee - totalFee;

  return {
    durationMinutes,
    billableHours,
    firstHourFee,
    subsequentHoursCount: (fullDays * 23) + subsequentHoursCount,
    subsequentHoursFee,
    uncappedFee,
    capAdjustment: Number(capAdjustment.toFixed(2)),
    totalFee: Number(totalFee.toFixed(2)),
  };
}

export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hrs`;
  return `${hours} hrs ${mins} mins`;
}
