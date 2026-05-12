export const getUserRole = () => {
  if (typeof window === 'undefined') return null

  return localStorage.getItem('userRole')
}

export const isAdmin = () => {
  return getUserRole() === 'admin'
}

export const isMember = () => {
  return getUserRole() === 'member'
}

export const canEditSelectedMonth = (
  selectedMonth: Date
) => {
  if (isAdmin()) return true

  if (isMember()) {
    const now = new Date()

    const currentMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )

    const previousMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      )

    const selected =
      new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        1
      )

    return (
      selected.getTime() === currentMonth.getTime() ||
      selected.getTime() === previousMonth.getTime()
    )
  }

  return false
}