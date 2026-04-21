// Design Ref: §5.4 — Episodes page: Server Component (초기 데이터 로드)
import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { toEpisode } from '@/types/episode'
import EpisodeList from '@/features/episodes/EpisodeList'

export default async function EpisodesPage() {
  const session = await auth()
  const supabase = await createClient()

  const { data } = await supabase
    .from('episodes')
    .select('*')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })

  const episodes = (data ?? []).map(toEpisode)

  return <EpisodeList episodes={episodes} />
}
