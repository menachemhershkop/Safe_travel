function getRiskLevel(riskPercent) {
  if (riskPercent <= 25) return 'low'
  if (riskPercent <= 60) return 'medium'
  if (riskPercent <= 85) return 'high'
  return 'extreme'
}

function getRiskLevelTitle(level) {
  switch (level) {
    case 'low':
      return 'סיכון נמוך'
    case 'medium':
      return 'סיכון בינוני'
    case 'high':
      return 'סיכון גבוה'
    case 'extreme':
      return 'סיכון קיצוני'
    default:
      return 'סיכון'
  }
}

function getRiskShortMessage(level) {
  switch (level) {
    case 'low':
      return 'סע בזהירות'
    case 'medium':
      return 'סע בסמיכות למרחב מוגן'
    case 'high':
      return 'אזהרת מסע'
    case 'extreme':
      return 'אזהרת מסע חמורה'
    default:
      return ''
  }
}

function getRiskLongMessage(level) {
  switch (level) {
    case 'low':
      return 'הדרך נראית בטוחה יחסית, אבל עדיין חשוב להישאר ערני.'
    case 'medium':
      return 'מומלץ לבחור מסלול מוכר ולהימנע מאזורים בעייתיים ככל האפשר.'
    case 'high':
      return 'שקול מסלול חלופי או דחייה של הנסיעה במידת האפשר.'
    case 'extreme':
      return 'מומלץ להימנע מהנסיעה. אם חייבים לצאת, היערכות מוקדמת היא חובה.'
    default:
      return ''
  }
}

export default function RiskMessage({ riskValue }) {
  const riskNumber = typeof riskValue === 'number' ? riskValue : Number(riskValue)

  if (!Number.isFinite(riskNumber)) {
    return (
      <div className="risk-message neutral">
        <div className="risk-percent-box">—%</div>
        <div className="risk-level-title">אין נתון</div>
        <div className="risk-level-text">אחוזי הסיכון: אין נתון מהשרת.</div>
        <div className="risk-scene neutral" aria-hidden="true">
          <div className="risk-road" />
          <div className="risk-actor">🛣️</div>
        </div>
      </div>
    )
  }

  const riskPercent = Math.round(riskNumber * 100)
  const level = getRiskLevel(riskPercent)

  const extremeMissiles = [
    { delay: '0ms' },
    { delay: '450ms' },
    { delay: '900ms' },
  ]

  return (
    <div className={`risk-message ${level}`}>
      <div className="risk-percent-box">{riskPercent}%</div>
      <div className="risk-level-title">{getRiskLevelTitle(level)}</div>
      <div className="risk-level-text">{getRiskShortMessage(level)}</div>
      <div className="risk-level-subtext">{getRiskLongMessage(level)}</div>
      <div className={`risk-scene ${level}`} aria-hidden="true">
        <div className="risk-road" />
        <div className="risk-actor car">🚗</div>

        {level === 'medium' ? (
          <div className="risk-actor megaphone">
            📣<span className="sound-waves" />
          </div>
        ) : null}

        {level === 'high' ? (
          <div className="risk-actor missile">
            <span className="missile-emoji">🚀</span>
            <span className="missile-boom" />
          </div>
        ) : null}

        {level === 'extreme'
          ? extremeMissiles.map((m, idx) => (
              <div key={idx} className="risk-actor missile" style={{ '--delay': m.delay }}>
                <span className="missile-emoji">🚀</span>
                <span className="missile-boom" />
              </div>
            ))
          : null}
      </div>
    </div>
  )
}

