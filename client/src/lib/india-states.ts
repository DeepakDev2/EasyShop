/** States used in address dropdown — keep in sync with checkout form */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

/** Map India Post / API state names → dropdown label */
const STATE_ALIASES: Record<string, string> = {
  'NCT OF DELHI': 'Delhi',
  'NEW DELHI': 'Delhi',
  'DELHI': 'Delhi',
  'ORISSA': 'Odisha',
  'UTTARANCHAL': 'Uttarakhand',
  'PONDICHERRY': 'Puducherry',
  'PUDUCHERRY': 'Puducherry',
  'JAMMU & KASHMIR': 'Jammu and Kashmir',
  'JAMMU AND KASHMIR': 'Jammu and Kashmir',
  'CHATTISGARH': 'Chhattisgarh',
  'CHHATTISGARH': 'Chhattisgarh',
  'ANDAMAN & NICOBAR ISLANDS': 'Andaman and Nicobar Islands',
  'ANDAMAN AND NICOBAR ISLANDS': 'Andaman and Nicobar Islands',
}

export function normalizeIndianState(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const alias = STATE_ALIASES[trimmed.toUpperCase()]
  if (alias) return alias

  const match = INDIAN_STATES.find(s => s.toLowerCase() === trimmed.toLowerCase())
  if (match) return match

  // Title case fallback for unknown but valid-looking names
  const title = trimmed
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  if (INDIAN_STATES.includes(title as (typeof INDIAN_STATES)[number])) return title

  return title
}
