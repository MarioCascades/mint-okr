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

export const canEditSelectedMonth = (selectedMonth: Date) => {
  if (isAdmin()) return true

  if (isMember()) {
    const now = new Date()

    return (
      selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
    )
  }

  return false
}