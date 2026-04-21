interface StrengthStarsProps {
  value: number // 1~5
}

export default function StrengthStars({ value }: StrengthStarsProps) {
  return (
    <span className="text-sm text-amber-400" aria-label={`강도 ${value}/5`}>
      {'★'.repeat(value)}
      <span className="text-gray-200">{'★'.repeat(5 - value)}</span>
    </span>
  )
}
