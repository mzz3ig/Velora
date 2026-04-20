import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const loadLocalEnv = () => {
  if (!existsSync('.env.local')) return

  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!match) continue

    const [, key, rawValue = ''] = match
    if (process.env[key]) continue

    const value = rawValue.trim().replace(/^['"]|['"]$/g, '')
    process.env[key] = value
  }
}

const required = (name) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

const findUserByEmail = async (supabase, email) => {
  const normalizedEmail = email.toLowerCase()
  const perPage = 1000

  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const users = data?.users || []
    const match = users.find((user) => user.email?.toLowerCase() === normalizedEmail)
    if (match || users.length < perPage) return match || null
  }

  throw new Error('Stopped after scanning 99 pages of users')
}

const main = async () => {
  loadLocalEnv()

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || required('VITE_SUPABASE_URL')
  const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY')
  const adminEmail = (process.env.ADMIN_EMAIL?.trim() || required('VITE_ADMIN_EMAIL')).toLowerCase()
  const adminPassword = required('ADMIN_PASSWORD')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const existingUser = await findUserByEmail(supabase, adminEmail)

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        ...existingUser.user_metadata,
        role: 'admin',
      },
    })

    if (error) throw error
    console.log(`Admin user already exists. Password updated for ${adminEmail}.`)
    return
  }

  const { error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
    },
  })

  if (error) throw error
  console.log(`Admin user created for ${adminEmail}.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
