interface TagBadgeProps {
  tag: string
  variant?: 'default' | 'primary'
}

export default function TagBadge({ tag, variant = 'default' }: TagBadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const styles = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-50 text-blue-700',
  }
  return <span className={`${base} ${styles[variant]}`}>{tag}</span>
}
