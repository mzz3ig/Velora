import { supabase } from '../lib/supabase'

const TABLE_NAME = 'velora_state'

async function getUserId() {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

export const supabaseStorage = {
  async getItem(name) {
    const userId = await getUserId()

    if (!userId) {
      return null
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('user_id', userId)
      .eq('store_key', name)
      .maybeSingle()

    if (error) {
      console.error(`Failed to load ${name} from Supabase`, error)
      return null
    }

    return data?.value ? JSON.stringify(data.value) : null
  },

  async setItem(name, value) {
    const userId = await getUserId()

    if (!userId) {
      return
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          user_id: userId,
          store_key: name,
          value: JSON.parse(value),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,store_key' },
      )

    if (error) {
      console.error(`Failed to save ${name} to Supabase`, error)
    }
  },

  async removeItem(name) {
    const userId = await getUserId()

    if (!userId) {
      return
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('store_key', name)

    if (error) {
      console.error(`Failed to remove ${name} from Supabase`, error)
    }
  },
}
