import math
from datetime import datetime
from functools import lru_cache
from typing import Dict, Any

@lru_cache(maxsize=128)
def get_cached_tariff(garage_code: str, base_rate: float, subsequent_rate: float, daily_cap: float) -> Dict[str, float]:
    """
    Cached tariff rule tuple. Cleared on tariff updates.
    """
    return {
        "garage_code": garage_code,
        "firstHourRate": base_rate,
        "subsequentHourRate": subsequent_rate,
        "dailyCap": daily_cap
    }

def clear_tariff_cache():
    get_cached_tariff.cache_clear()

def calculate_fee(
    entry_time_str: str,
    exit_time_str: str,
    base_rate: float = 50.0,
    subsequent_rate: float = 30.0,
    daily_cap: float = 250.0
) -> Dict[str, Any]:
    """
    Pure Python function for tiered tariff calculation.
    Part-hours round UP using math.ceil(durationMinutes / 60).
    Base rate applies to hour 1, subsequent rate applies to remaining hours, capped at 24-hr daily cap.
    """
    entry = datetime.fromisoformat(entry_time_str.replace('Z', '+00:00'))
    exit_dt = datetime.fromisoformat(exit_time_str.replace('Z', '+00:00'))

    duration_seconds = max(1.0, (exit_dt - entry).total_seconds())
    duration_minutes = max(1, math.ceil(duration_seconds / 60.0))
    billable_hours = math.ceil(duration_minutes / 60.0)

    full_days = billable_hours // 24
    remaining_hours = billable_hours % 24

    first_hour_fee = 0.0
    subsequent_hours_count = 0
    subsequent_hours_fee = 0.0
    partial_day_uncapped = 0.0

    if remaining_hours > 0:
        first_hour_fee = base_rate
        subsequent_hours_count = remaining_hours - 1
        subsequent_hours_fee = subsequent_hours_count * subsequent_rate
        partial_day_uncapped = first_hour_fee + subsequent_hours_fee

    partial_day_capped = min(partial_day_uncapped, daily_cap) if remaining_hours > 0 else 0.0
    uncapped_fee = (full_days * daily_cap) + partial_day_uncapped
    total_fee = (full_days * daily_cap) + partial_day_capped
    cap_adjustment = uncapped_fee - total_fee

    return {
        "durationMinutes": duration_minutes,
        "billableHours": billable_hours,
        "firstHourFee": round(first_hour_fee, 2),
        "subsequentHoursCount": (full_days * 23) + subsequent_hours_count,
        "subsequentHoursFee": round(subsequent_hours_fee, 2),
        "uncappedFee": round(uncapped_fee, 2),
        "capAdjustment": round(cap_adjustment, 2),
        "totalFee": round(total_fee, 2),
    }
