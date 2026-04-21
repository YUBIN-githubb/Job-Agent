import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { toJob } from '@/types/job'
import JobList from '@/features/jobs/JobList'

export default async function JobsPage() {
  const session = await auth()
  const supabase = await createClient()

  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })

  const jobs = (data ?? []).map(toJob)

  return <JobList jobs={jobs} />
}
