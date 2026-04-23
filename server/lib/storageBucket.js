const { getSupabaseAdmin } = require('./supabase')
const { HttpError } = require('./httpError')

const BUCKET = 'velora-files'
const MAX_BYTES = 50 * 1024 * 1024

async function ensureBucketExists() {
  const supabase = getSupabaseAdmin()
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new HttpError(500, 'Storage unavailable', { cause: error })

  const exists = (buckets || []).some((b) => b?.name === BUCKET || b?.id === BUCKET)
  if (exists) return

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: null,
  })

  // If it already exists due to a race, ignore.
  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw new HttpError(500, 'Failed to provision storage bucket', { cause: createError })
  }
}

module.exports = { BUCKET, MAX_BYTES, ensureBucketExists }

