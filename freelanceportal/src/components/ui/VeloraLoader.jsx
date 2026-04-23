export default function VeloraLoader({
  label = 'Loading',
  words = ['tasks', 'projects', 'files', 'invoices', 'tasks'],
  size = 18,
  className = '',
  style = {},
  surface = false,
}) {
  const items = (words && words.length > 0) ? words : ['loading', 'loading', 'loading', 'loading', 'loading']
  const readableLabel = (label && String(label).trim()) ? label : 'Loading'
  const content = (
    <div
      className={`velora-loader${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      style={{ '--velora-loader-font-size': `${size}px`, ...style }}
    >
      {label ? <span className="velora-loader__label">{label}</span> : null}
      <span className="velora-loader__words" aria-hidden="true">
        {items.map((word, index) => (
          <span key={`${word}-${index}`} className="velora-loader__word">
            {word}
          </span>
        ))}
      </span>
      <span className="sr-only">{readableLabel}…</span>
    </div>
  )

  if (!surface) return content

  return (
    <div className="velora-loader-surface">
      {content}
    </div>
  )
}
