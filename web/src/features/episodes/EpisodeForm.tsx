'use client'
// Design Ref: §5.4 — Episode form: title, primary_competency, tags, strength, STAR fields

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { episodeSchema, type EpisodeFormValues } from './schemas'
import { createEpisode, updateEpisode } from './actions'
import {
  PRIMARY_COMPETENCIES,
  COMPETENCY_TAGS,
  CONTEXT_TAGS,
  type Episode,
  type PrimaryCompetency,
} from '@/types/episode'

interface EpisodeFormProps {
  defaultValues?: Partial<Episode>
  episodeId?: string
  onClose: () => void
}

export default function EpisodeForm({ defaultValues, episodeId, onClose }: EpisodeFormProps) {
  const isEdit = !!episodeId
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      source: defaultValues?.source ?? '',
      title: defaultValues?.title ?? '',
      primaryCompetency: defaultValues?.primaryCompetency as PrimaryCompetency | undefined,
      tags: defaultValues?.tags ?? [],
      strength: defaultValues?.strength ?? 3,
      situation: defaultValues?.situation ?? '',
      task: defaultValues?.task ?? '',
      action: defaultValues?.action ?? '',
      result: defaultValues?.result ?? '',
      coreMessage: defaultValues?.coreMessage ?? '',
    },
  })

  const selectedCompetency = watch('primaryCompetency')
  const selectedTags = watch('tags')

  const availableTags = selectedCompetency
    ? [...(COMPETENCY_TAGS[selectedCompetency] ?? []), ...CONTEXT_TAGS]
    : [...CONTEXT_TAGS]

  async function onSubmit(values: EpisodeFormValues) {
    setSubmitting(true)
    const result = isEdit
      ? await updateEpisode(episodeId, values)
      : await createEpisode(values)

    if (!result.success) {
      alert(result.error)
      setSubmitting(false)
      return
    }
    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          {isEdit ? '에피소드 수정' : '에피소드 추가'}
        </h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {/* 기본 정보 */}
      <Field
        label="제목 *"
        description="이 경험을 한 줄로 요약한 이름입니다. 나중에 목록에서 빠르게 찾을 수 있도록 구체적으로 적으세요."
        error={errors.title?.message}
      >
        <input
          {...register('title')}
          placeholder="예: Picket 예매 시스템 Deadlock 해결"
          className={inputCls(!!errors.title)}
        />
      </Field>

      {/* 역량 카테고리 */}
      <Field
        label="핵심 역량 카테고리 *"
        description="이 에피소드가 가장 잘 보여주는 역량의 대분류입니다. AI가 문항과 에피소드를 매칭할 때 사용합니다."
        error={errors.primaryCompetency?.message}
      >
        <Controller
          name="primaryCompetency"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={inputCls(!!errors.primaryCompetency)}
              onChange={(e) => {
                field.onChange(e)
                setValue('tags', [])
              }}
            >
              <option value="">선택해 주세요</option>
              {PRIMARY_COMPETENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        />
      </Field>

      {/* 태그 */}
      <Field
        label="역량 태그 (1~5개) *"
        description="카테고리 안에서 더 구체적으로 어떤 역량을 보여주는지 선택하세요. 자소서 문항의 요구 역량과 세밀하게 매칭됩니다."
        error={errors.tags?.message}
      >
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const checked = field.value.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (checked) {
                        field.onChange(field.value.filter((t) => t !== tag))
                      } else if (field.value.length < 5) {
                        field.onChange([...field.value, tag])
                      }
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                      checked
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          )}
        />
        {selectedTags.length > 0 && (
          <p className="mt-1 text-xs text-gray-400">선택됨: {selectedTags.join(', ')}</p>
        )}
      </Field>

      {/* 강도 */}
      <Field
        label="설득력 (1~5)"
        description="이 에피소드가 자소서 소재로 얼마나 강력한지 스스로 평가하세요. 5에 가까울수록 우선 매칭됩니다."
        error={errors.strength?.message}
      >
        <Controller
          name="strength"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => field.onChange(n)}
                  className={`w-9 h-9 rounded-lg border text-sm font-medium transition ${
                    field.value === n
                      ? 'bg-amber-400 text-white border-amber-400'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        />
      </Field>

      {/* STAR */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700">STAR 구조</p>
          <p className="mt-0.5 text-xs text-gray-400">자소서 AI 생성의 핵심 재료입니다. 구체적으로 작성할수록 완성도 높은 자소서가 만들어집니다.</p>
        </div>
        <Field
          label="Situation (상황)"
          description="이 경험이 시작된 배경을 설명하세요. 어떤 조직·프로젝트·환경이었는지, 어떤 문제가 존재했는지 씁니다."
          error={errors.situation?.message}
        >
          <textarea
            {...register('situation')}
            rows={4}
            placeholder="예: 팀 프로젝트에서 동시 접속자가 늘어나며 예매 처리 중 데이터가 중복 저장되는 오류가 발생했습니다."
            className={inputCls(false)}
          />
        </Field>
        <Field
          label="Task (과제)"
          description="내가 맡은 역할과 해결해야 했던 과제를 작성하세요. '나는 무엇을 해야 했는가'에 답하는 칸입니다."
          error={errors.task?.message}
        >
          <textarea
            {...register('task')}
            rows={3}
            placeholder="예: 백엔드 담당자로서 Deadlock 원인을 파악하고 트랜잭션 처리 방식을 개선해야 했습니다."
            className={inputCls(false)}
          />
        </Field>
        <Field
          label="Action (행동) *"
          description="내가 실제로 취한 행동을 가장 구체적으로 서술하세요. 수치·고유명사·기술 이름을 그대로 쓸수록 좋습니다."
          error={errors.action?.message}
        >
          <textarea
            {...register('action')}
            rows={6}
            placeholder="예: MySQL의 SHOW ENGINE INNODB STATUS로 락 경합을 확인한 뒤, 트랜잭션 격리 수준을 READ COMMITTED로 낮추고 낙관적 락을 적용했습니다. 또한 인덱스 순서를 통일해 순환 참조를 제거했습니다."
            className={inputCls(!!errors.action)}
          />
        </Field>
        <Field
          label="Result (결과) *"
          description="행동의 결과를 수치로 표현하세요. 정확한 수치가 없다면 비율·기간·규모 등 어떤 형태로든 측정값을 포함하세요."
          error={errors.result?.message}
        >
          <textarea
            {...register('result')}
            rows={4}
            placeholder="예: Deadlock 발생 빈도가 0으로 감소했고, 예매 처리 속도가 기존 대비 40% 향상되었습니다. 이후 팀 코드 리뷰에서 트랜잭션 설계 기준으로 채택되었습니다."
            className={inputCls(!!errors.result)}
          />
        </Field>
        <Field
          label="핵심 메시지 (한 문장)"
          description="이 에피소드 전체를 관통하는 메시지를 한 문장으로 정리하세요. AI가 자소서 도입부 방향을 잡을 때 활용합니다."
          error={errors.coreMessage?.message}
        >
          <textarea
            {...register('coreMessage')}
            rows={2}
            placeholder="예: 문제의 근본 원인을 데이터로 찾아내고, 구조적으로 해결하는 접근 방식을 보여주는 경험입니다."
            className={inputCls(false)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition disabled:opacity-50"
        >
          {submitting ? '저장 중...' : isEdit ? '수정 완료' : '추가'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  description,
  error,
  children,
}: {
  label: string
  description?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-0.5 block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="mb-1.5 text-xs text-gray-400 leading-relaxed">{description}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
    hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
  }`
}
