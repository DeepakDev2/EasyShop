import { createError } from '../middleware/errorHandler'

const STATE_ALIASES: Record<string, string> = {
  'NCT OF DELHI': 'Delhi',
  'NEW DELHI': 'Delhi',
  DELHI: 'Delhi',
  ORISSA: 'Odisha',
  UTTARANCHAL: 'Uttarakhand',
  PONDICHERRY: 'Puducherry',
  PUDUCHERRY: 'Puducherry',
  'JAMMU & KASHMIR': 'Jammu and Kashmir',
  'JAMMU AND KASHMIR': 'Jammu and Kashmir',
  CHATTISGARH: 'Chhattisgarh',
  CHHATTISGARH: 'Chhattisgarh',
}

/** Used when India Post API is unreachable (offline / SSL / firewall) */
const PINCODE_FALLBACK: Record<string, { city: string; state: string }> = {
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '560034': { city: 'Bengaluru', state: 'Karnataka' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
}

const KNOWN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

function normalizeState(raw: string): string {
  const trimmed = raw.trim()
  const alias = STATE_ALIASES[trimmed.toUpperCase()]
  if (alias) return alias
  const match = KNOWN_STATES.find(s => s.toLowerCase() === trimmed.toLowerCase())
  if (match) return match
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

type PostOffice = {
  District?: string
  State?: string
  Region?: string
  Block?: string
  Name?: string
}

export const lookupPincode = async (pin: string) => {
  if (!/^\d{6}$/.test(pin)) throw createError('Pincode must be 6 digits', 400, 'INVALID_PINCODE')

  const urls = [
    `https://api.postalpincode.in/pincode/${pin}`,
    `http://api.postalpincode.in/pincode/${pin}`,
  ]

  let lastError: Error | null = null

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue

      const data = await res.json() as {
        Status?: string
        Message?: string
        PostOffice?: PostOffice[] | null
      }[]

      const block = Array.isArray(data) ? data[0] : null
      if (block?.Status === 'Success' && block.PostOffice?.length) {
        const offices = block.PostOffice
        const office = offices.find(o => o.District && o.State) ?? offices[0]
        const city = (office.District || office.Region || office.Block || office.Name || '').trim()
        const state = normalizeState(office.State || '')

        if (city && state) return { pincode: pin, city, state }
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  const fallback = PINCODE_FALLBACK[pin]
  if (fallback) {
    return { pincode: pin, city: fallback.city, state: normalizeState(fallback.state) }
  }

  throw createError('Pincode not found. Please enter city and state manually.', 404, 'PINCODE_NOT_FOUND')
}
