const TOKEN_KEY = 'easyshop_token'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `easyshop_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
}

export const clearToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = 'easyshop_token=; path=/; max-age=0; SameSite=Lax'
}
