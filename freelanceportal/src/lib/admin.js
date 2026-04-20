const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL

export const adminEmail = configuredAdminEmail?.trim().toLowerCase() || ''

export const isAdminEmail = (email) => {
  if (!adminEmail) return false
  return email?.trim().toLowerCase() === adminEmail
}
