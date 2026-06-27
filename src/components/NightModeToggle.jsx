export default function NightModeToggle({ isNight, onToggle }) {
  return (
    <button
      className="btn"
      onClick={onToggle}
      aria-label={isNight ? 'Switch to day mode' : 'Switch to night mode'}
      title={isNight ? 'Day mode' : 'Night mode'}
      style={{ padding: '0.5rem 0.85rem', fontSize: '1rem' }}
    >
      {isNight ? '☀️' : '🌙'}
    </button>
  )
}
