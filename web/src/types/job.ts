// Design Ref: §3.1 — Job entity type definition

export interface EssayQuestion {
  number: number
  title: string
  body: string
}

export const JOB_STATUSES = [
  '수집완료',
  '분석완료',
  '문항분석완료',
  '자소서작성중',
  '자소서완료',
  '지원완료',
  '결과대기',
  '최종결과',
  '마감',
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export interface Job {
  id: string
  userId: string
  jobId: string
  company: string
  title: string
  deadline?: string
  status: JobStatus
  body?: string
  questions: EssayQuestion[]
  linkedFiles: {
    companyReportId?: string
    questionAnalysisId?: string
  }
  createdAt: string
}

export function toJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    jobId: row.job_id as string,
    company: row.company as string,
    title: row.title as string,
    deadline: row.deadline as string | undefined,
    status: (row.status as JobStatus) ?? '수집완료',
    body: row.body as string | undefined,
    questions: (row.questions as EssayQuestion[]) ?? [],
    linkedFiles: (row.linked_files as Job['linkedFiles']) ?? {},
    createdAt: row.created_at as string,
  }
}
