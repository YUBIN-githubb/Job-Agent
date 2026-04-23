'use client'
// Design Ref: §5.4 — Job form: company, title, deadline, body, questions

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { jobSchema, type JobFormValues } from './schemas'
import { createJob } from './actions'

interface JobFormProps {
  onClose: () => void
}

export default function JobForm({ onClose }: JobFormProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: '',
      title: '',
      deadline: '',
      body: '',
      charLimit: undefined,
      questions: [{ number: 1, text: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })

  async function onSubmit(values: JobFormValues) {
    setSubmitting(true)
    const result = await createJob(values)
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
        <h2 className="font-semibold text-gray-900">공고 등록</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="기업명 *" error={errors.company?.message}>
          <input {...register('company')} placeholder="예: 서울지방우정청" className={inputCls(!!errors.company)} />
        </Field>
        <Field label="포지션 *" error={errors.title?.message}>
          <input {...register('title')} placeholder="예: 웹 개발 인턴" className={inputCls(!!errors.title)} />
        </Field>
        <Field label="마감일" error={errors.deadline?.message}>
          <input type="date" {...register('deadline')} className={inputCls(false)} />
        </Field>
        <Field label="글자 수 제한" error={errors.charLimit?.message}>
          <input
            type="number"
            {...register('charLimit')}
            placeholder="예: 500 (전체 문항 공통)"
            className={inputCls(!!errors.charLimit)}
          />
        </Field>
      </div>

      <Field label="공고 본문" error={errors.body?.message}>
        <textarea
          {...register('body')}
          rows={4}
          placeholder="공고 내용을 붙여넣으세요 (기업 분석에 활용됩니다)"
          className={inputCls(false)}
        />
      </Field>

      {/* 자소서 문항 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">자소서 문항 *</p>
          <button
            type="button"
            onClick={() => append({ number: fields.length + 1, text: '' })}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + 문항 추가
          </button>
        </div>
        {errors.questions?.root && (
          <p className="mb-2 text-xs text-red-500">{errors.questions.root.message}</p>
        )}
        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Q{i + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
              <textarea
                {...register(`questions.${i}.text`)}
                rows={3}
                placeholder="문항 내용을 입력해 주세요 (예: 지원동기 및 진로계획을 서술하시오)"
                className={inputCls(!!errors.questions?.[i]?.text)}
              />
            </div>
          ))}
        </div>
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
          {submitting ? '저장 중...' : '등록'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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
