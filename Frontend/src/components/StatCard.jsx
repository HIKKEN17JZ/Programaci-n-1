function StatCard({
  valor,
  etiqueta,
  targetId,
  isActive = false,
  onClick,
  icono,
  subetiqueta,
}) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="col-12 col-md-4 mb-3">
      <div
        className={`card border-0 shadow-sm h-100 stat-card ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <div className="card-body d-flex flex-column justify-content-center text-center py-3">
          {icono && <span className="fs-4 mb-1 d-block">{icono}</span>}
          <p className="fs-2 fw-bold text-primary mb-1">{valor}</p>
          <p className="text-secondary fw-semibold mb-1">{etiqueta}</p>
          {isActive ? (
            <span className="badge text-bg-primary mx-auto small px-2 py-1 mt-1">
              ● Mostrando detalle
            </span>
          ) : (
            <span className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
              {subetiqueta || 'Clic para explorar'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatCard
