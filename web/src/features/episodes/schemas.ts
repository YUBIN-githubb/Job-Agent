import { z } from 'zod'
import { PRIMARY_COMPETENCIES } from '@/types/episode'

export const episodeSchema = z.object({
  episodeId: z.string().min(1, '에피소드 ID를 입력해 주세요'),
  source: z.string().optional(),
  title: z.string().min(1, '제목을 입력해 주세요').max(100),
  primaryCompetency: z.enum(PRIMARY_COMPETENCIES, {
    errorMap: () => ({ message: '역량 카테고리를 선택해 주세요' }),
  }),
  tags: z.array(z.string()).min(1, '태그를 1개 이상 선택해 주세요').max(5),
  strength: z.coerce.number().int().min(1).max(5),
  situation: z.string().optional(),
  task: z.string().optional(),
  action: z.string().min(1, '행동(Action)을 입력해 주세요'),
  result: z.string().min(1, '결과(Result)를 입력해 주세요'),
  coreMessage: z.string().optional(),
})

export type EpisodeFormValues = z.infer<typeof episodeSchema>
