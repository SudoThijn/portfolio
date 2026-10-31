const SEGMENTS = 12
const GUESSES_PER_SECOND = 1e10
const YEAR = 31557600
const COMMON = [
  'password',
  'wachtwoord',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'admin',
  'welcome',
  'welkom',
  'letmein',
  'iloveyou',
  'monkey',
  'dragon',
  'hunter2',
  'abc123',
  'football',
]

export const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+?'
export const METER_SEGMENTS = SEGMENTS

export type Rank = 'critical' | 'weak' | 'decent' | 'strong' | 'overkill'

function analyse(pw: string) {
  let pool = 0
  if (/[a-z]/.test(pw)) pool += 26
  if (/[A-Z]/.test(pw)) pool += 26
  if (/[0-9]/.test(pw)) pool += 10
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33
  let bits = pw.length && pool ? pw.length * Math.log2(pool) : 0
  const common = COMMON.includes(pw.toLowerCase())
  // Leaked-list passwords and single repeated characters fall to the first guesses.
  if (common || /^(.)\1*$/.test(pw)) bits = Math.min(bits, 4)
  return { pool, bits, common }
}

export function formatTime(seconds: number) {
  if (seconds < 1) return 'instantly'
  const units: [string, number][] = [
    ['year', YEAR],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  const years = seconds / YEAR
  if (years > 1.38e10) return 'after the universe ends'
  if (years > 1e6) return `in ${Math.round(years / 1e6).toLocaleString('en')} million years`
  for (const [name, size] of units) {
    if (seconds >= size) {
      const n = Math.round(seconds / size)
      return `in ${n.toLocaleString('en')} ${name}${n === 1 ? '' : 's'}`
    }
  }
  return 'instantly'
}

function rankFor(bits: number): [Rank, string] {
  if (bits < 40) return ['critical', 'Critical']
  if (bits < 60) return ['weak', 'Weak']
  if (bits < 80) return ['decent', 'Decent']
  if (bits < 110) return ['strong', 'Strong']
  return ['overkill', 'Overkill']
}

export function inspectPassword(pw: string) {
  const { pool, bits, common } = analyse(pw)
  const [rank, label] = rankFor(bits)
  return {
    rank,
    label: common ? 'Leaked' : label,
    time: formatTime(2 ** bits / 2 / GUESSES_PER_SECOND),
    length: pw.length,
    pool,
    bits: Math.round(bits),
    filled: Math.min(SEGMENTS, Math.ceil(bits / 10)),
  }
}

export function randomPassword(length = 20) {
  const bytes = new Uint8Array(length * 2)
  let pw = ''
  while (pw.length < length) {
    crypto.getRandomValues(bytes)
    for (const b of bytes) {
      // Rejection sampling keeps every character equally likely.
      if (b < 256 - (256 % CHARSET.length) && pw.length < length) pw += CHARSET[b % CHARSET.length]
    }
  }
  return pw
}
