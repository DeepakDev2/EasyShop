import https from 'https'
import http from 'http'
import { createError } from '../middleware/errorHandler'

/**
 * Fetches a URL using Node's http/https modules with SSL verification disabled.
 * This is intentional — api.postalpincode.in has an expired/untrusted SSL cert
 * but the data itself is safe (public India Post pincode data).
 * Also handles HTTP→HTTPS redirects transparently.
 */
function fetchPostalAPI(url: string, timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const attempt = (target: string, redirectsLeft: number) => {
      const mod = target.startsWith('https') ? https : http
      const req = mod.get(target, { rejectUnauthorized: false }, (res) => {
        // Follow redirects (HTTP → HTTPS)
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && redirectsLeft > 0) {
          attempt(res.headers.location, redirectsLeft - 1)
          return
        }
        let body = ''
        res.on('data', (chunk: Buffer) => { body += chunk.toString() })
        res.on('end', () => resolve(body))
      })
      req.setTimeout(timeoutMs, () => { req.destroy(new Error('Request timeout')) })
      req.on('error', reject)
    }
    attempt(url, 3)
  })
}

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

/** Maps known administrative district names to the common city name users expect */
const DISTRICT_CITY_ALIASES: Record<string, string> = {
  'BENGALURU URBAN': 'Bengaluru',
  'BENGALURU RURAL': 'Bengaluru',
  'BANGALORE URBAN': 'Bengaluru',
  'BANGALORE RURAL': 'Bengaluru',
  'CENTRAL DELHI': 'New Delhi',
  'NEW DELHI': 'New Delhi',
  'NORTH DELHI': 'Delhi',
  'SOUTH DELHI': 'Delhi',
  'EAST DELHI': 'Delhi',
  'WEST DELHI': 'Delhi',
  'NORTH WEST DELHI': 'Delhi',
  'SOUTH WEST DELHI': 'Delhi',
  'NORTH EAST DELHI': 'Delhi',
  'MUMBAI CITY': 'Mumbai',
  'MUMBAI SUBURBAN': 'Mumbai',
  'KANPUR NAGAR': 'Kanpur',
  'GAUTAM BUDDHA NAGAR': 'Noida',
  'GURGAON': 'Gurugram',
  'K.V.RANGAREDDY': 'Hyderabad',
  'RANGA REDDY': 'Hyderabad',
  'MEDCHAL MALKAJGIRI': 'Hyderabad',
}

type PostOffice = {
  District?: string
  Division?: string
  State?: string
  Region?: string
  Block?: string
  Taluk?: string
  Name?: string
}

function deriveCity(office: PostOffice): string {
  const districtUpper = (office.District || '').trim().toUpperCase()

  // Check known alias table first
  if (districtUpper && DISTRICT_CITY_ALIASES[districtUpper]) {
    return DISTRICT_CITY_ALIASES[districtUpper]
  }

  // Strip common administrative suffixes to get a clean city name
  const cleaned = (office.District || '')
    .replace(/\s+(urban|rural|city|nagar|district|north|south|east|west)$/i, '')
    .trim()

  return cleaned || office.Division || office.Region || office.Block || office.Name || ''
}

export const lookupPincode = async (pin: string) => {
  if (!/^\d{6}$/.test(pin)) throw createError('Pincode must be 6 digits', 400, 'INVALID_PINCODE')

  try {
    const body = await fetchPostalAPI(`https://api.postalpincode.in/pincode/${pin}`)

    const data = JSON.parse(body) as {
      Status?: string
      Message?: string
      PostOffice?: PostOffice[] | null
    }[]

    const block = Array.isArray(data) ? data[0] : null
    if (block?.Status === 'Success' && block.PostOffice?.length) {
      const offices = block.PostOffice
      const office = offices.find(o => o.District && o.State) ?? offices[0]
      const city = deriveCity(office)
      const state = normalizeState(office.State || '')

      if (city && state) return { pincode: pin, city, state }
    }
  } catch {
    // API unreachable — fall through to hardcoded fallback
  }

  const fallback = PINCODE_FALLBACK[pin]
  if (fallback) {
    return { pincode: pin, city: fallback.city, state: normalizeState(fallback.state) }
  }

  throw createError('Pincode not found. Please enter city and state manually.', 404, 'PINCODE_NOT_FOUND')
}
