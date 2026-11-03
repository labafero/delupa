export const APP_ROLES = ['admin', 'client'] as const

export type AppRole = (typeof APP_ROLES)[number]

export function isAppRole(value: unknown): value is AppRole {
  return APP_ROLES.includes(value as AppRole)
}

export function resolveAppReturnPath(candidate: unknown, fallback = '/'): string {
  if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback
  }

  if (candidate.includes('\\') || /[\u0000-\u001f\u007f]/.test(candidate)) return fallback

  try {
    const base = new URL('https://delupa.invalid')
    const target = new URL(candidate, base)
    if (target.origin !== base.origin || target.hash) return fallback
    return `${target.pathname}${target.search}`
  } catch {
    return fallback
  }
}

export function getPasswordRecoveryRedirect(origin: string): string {
  const callbackUrl = new URL('/auth/callback', origin)
  callbackUrl.searchParams.set('next', '/definir-senha')
  return callbackUrl.toString()
}

export function getPasswordRecoveryErrorMessage(
  error: { status?: number; code?: string } | null
): string {
  if (error?.status === 429 || error?.code === 'over_email_send_rate_limit') {
    return 'O limite de envio de e-mails foi atingido. Aguarde até uma hora e use o link mais recente enviado.'
  }

  return 'Não foi possível enviar o link. Confira o e-mail e tente novamente.'
}
