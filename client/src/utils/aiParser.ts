import type { AIParseResult, VehicleType } from '../types/parking';

export function parseAICommand(prompt: string): AIParseResult {
  const clean = prompt.trim();
  if (!clean) {
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      message: 'Please enter a command (e.g., "Check in EV plate XYZ-123")',
    };
  }

  const isCheckIn = /check\s*in|park|arrival|inbound|enter/i.test(clean);
  const isCheckOut = /check\s*out|release|exit|departure|leave/i.test(clean);

  // Intent
  let intent: 'CHECK_IN' | 'CHECK_OUT' | 'UNKNOWN' = 'UNKNOWN';
  if (isCheckIn && !isCheckOut) intent = 'CHECK_IN';
  else if (isCheckOut && !isCheckIn) intent = 'CHECK_OUT';
  else if (isCheckIn && isCheckOut) {
    intent = clean.toLowerCase().indexOf('in') < clean.toLowerCase().indexOf('out') ? 'CHECK_IN' : 'CHECK_OUT';
  } else {
    // Fallback heuristic: if it mentions EV/compact/standard, assume check-in
    if (/(ev|electric|compact|standard|plate)/i.test(clean)) {
      intent = 'CHECK_IN';
    }
  }

  // Vehicle Type
  let vehicleType: VehicleType | undefined;
  if (/\b(ev|electric|tesla|charger)\b/i.test(clean)) vehicleType = 'EV';
  else if (/\b(compact|small|mini|hatchback)\b/i.test(clean)) vehicleType = 'COMPACT';
  else if (/\b(standard|sedan|suv|truck|regular)\b/i.test(clean)) vehicleType = 'STANDARD';
  else if (intent === 'CHECK_IN') vehicleType = 'STANDARD'; // default for check-in if unspecified

  // Spot Code matching (EV-1, CP-2, ST-3)
  const spotMatch = clean.match(/\b(EV|CP|ST)-\d+\b/i) || clean.match(/spot\s*([a-z0-9-]+)/i);
  const spotCode = spotMatch ? spotMatch[1] || spotMatch[0] : undefined;

  // License Plate matching
  let plateNumber: string | undefined;
  
  // Explicit "plate XYZ-123" pattern
  const explicitPlateMatch = clean.match(/plate\s*([a-z0-9-]+)/i);
  if (explicitPlateMatch) {
    plateNumber = explicitPlateMatch[1].toUpperCase();
  } else {
    // Generic license plate token regex (alphanumeric with optional hyphen)
    const tokens = clean.split(/\s+/);
    for (const token of tokens) {
      const sanitized = token.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
      // Exclude common command keywords
      if (
        /^[A-Z0-9-]{3,10}$/.test(sanitized) &&
        !['CHECK', 'IN', 'OUT', 'EV', 'COMPACT', 'STANDARD', 'PARK', 'PLATE', 'SPOT', 'CAR', 'TO'].includes(sanitized) &&
        !/^PULSE$/i.test(sanitized) &&
        !/^(EV|CP|ST)-\d+$/i.test(sanitized)
      ) {
        plateNumber = sanitized;
        break;
      }
    }
  }

  if (intent === 'UNKNOWN') {
    return {
      intent: 'UNKNOWN',
      confidence: 0.2,
      message: 'Unable to discern intent. Try specifying "Check in" or "Check out".',
    };
  }

  if (intent === 'CHECK_IN') {
    const confidence = (plateNumber ? 0.4 : 0) + (vehicleType ? 0.3 : 0) + 0.3;
    return {
      intent: 'CHECK_IN',
      plateNumber,
      vehicleType,
      spotCode: spotCode?.toUpperCase(),
      confidence,
      message: `Parsed Check-in: Vehicle ${vehicleType || 'STANDARD'}, Plate ${plateNumber || '[Not Specified]'}${spotCode ? `, Spot ${spotCode}` : ''}.`,
    };
  } else {
    const confidence = (plateNumber || spotCode) ? 0.9 : 0.4;
    return {
      intent: 'CHECK_OUT',
      plateNumber,
      spotCode: spotCode?.toUpperCase(),
      confidence,
      message: `Parsed Check-out: Target ${plateNumber || spotCode || '[Not Specified]'}.`,
    };
  }
}
