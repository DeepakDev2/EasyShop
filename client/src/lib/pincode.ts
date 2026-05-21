import api from '@/lib/api'
import { normalizeIndianState } from '@/lib/india-states'

export interface PincodeLookupResult {
  pincode: string
  city: string
  state: string
}

export async function lookupPincode(pin: string, signal?: AbortSignal): Promise<PincodeLookupResult> {
  const digits = pin.replace(/\D/g, '')
  if (digits.length !== 6) throw new Error('Pincode must be 6 digits')

  const res = await api.get(`/pincode/${digits}`, { signal })
  const { city, state, pincode } = res.data.data as PincodeLookupResult

  const normalizedState = normalizeIndianState(state) ?? state

  return { pincode, city, state: normalizedState }
}
