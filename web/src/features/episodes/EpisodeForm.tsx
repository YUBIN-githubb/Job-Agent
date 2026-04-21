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
  TECH_TAGS,
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
    formState: { errors },
  } = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      episodeId: defaultValues?.episodeId ?? '',
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
    ? [...(COMPETENCY_TAGS[selectedCompetency] ?? []), ...CONTEXT_TAGS, ...TECH_TAGS]
    : [...CONTEXT_TAGS, ...TECH_TAGS]

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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="제목 *" error={errors.title?.message}>
          <input
            {...register('title')}
            placeholder="예: Picket 예매 시스템 Deadlock 해결"
            className={inputCls(!!errors.title)}
          />
        </Field>
        <Field label="에피소드 ID *" error={errors.episodeId?.message}>
          <input
            {...register('episodeId')}
            placeholder="예: picket-deadlock-solving"
            className={inputCls(!!errors.episodeId)}
          />
        </Field>
      </div>

      {/* 역량 카테고리 */}
      <Field label="핵심 역량 카테고리 *" error={errors.primaryCompetency?.message}>
        <Controller
          name="primaryCompetency"
          control={control}
          render={({ field }) => (
            <select {...field} className={inputCls(!!errors.primaryCompetency)}>
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
      <Field label="역량 태그 (1~5개) *" error={errors.tags?.message}>
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
      <Field label="설득력 (1~5)" error={errors.strength?.message}>
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
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">STAR 구조</p>
        <Field label="Situation (상황)" error={errors.situation?.message}>
          <textarea {...register('situation')} rows={2} className={inputCls(false)} />
        </Field>
        <Field label="Task (과제)" error={errors.task?.message}>
          <textarea {...register('task')} rows={2} className={inputCls(false)} />
        </Field>
        <Field label="Action (행동) *" error={errors.action?.message}>
          <textarea
            {...register('action')}
            rows={3}
            placeholder="가장 구체적으로 작성하세요. 수치와 고유명사를 포함하세요."
            className={inputCls(!!errors.action)}
          />
        </Field>
        <Field label="Result (결과) *" error={errors.result?.message}>
          <textarea
            {...register('result')}
            rows={2}
            placeholder="수치 포함 결과를 작성하세요."
            className={inputCls(!!errors.result)}
          />
        </Field>
        <Field label="핵심 메시지 (한 문장)" error={errors.coreMessage?.message}>
          <input
            {...register('coreMessage')}
            placeholder="이 에피소드가 전달하는 핵심 메시지"
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
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
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
