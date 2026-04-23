import { z } from 'zod'
import { JOB_STATUSES } from '@/types/job'

export const essayQuestionSchema = z.object({
  number: z.coerce.number().int().min(1),
  text: z.string().min(1, '문항 내용을 입력해 주세요'),
})

export const jobSchema = z.object({
  company: z.string().min(1, '기업명을 입력해 주세요'),
  title: z.string().min(1, '포지션을 입력해 주세요'),
  deadline: z.string().optional(),
  body: z.string().optional(),
  charLimit: z.coerce.number().int().min(1).optional(),
  questions: z.array(essayQuestionSchema).min(1, '자소서 문항을 1개 이상 추가해 주세요'),
})

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
})

export type JobFormValues = z.infer<typeof jobSchema>
