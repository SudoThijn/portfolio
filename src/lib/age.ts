const BIRTH = { year: 2003, month: 10, day: 7 }

interface DateParts {
  year: number
  month: number
  day: number
}

// Whole years on the given calendar date, so the age goes up on the birthday itself.
export function ageOn({ year, month, day }: DateParts) {
  const hadBirthday = month > BIRTH.month || (month === BIRTH.month && day >= BIRTH.day)
  return year - BIRTH.year - (hadBirthday ? 0 : 1)
}
