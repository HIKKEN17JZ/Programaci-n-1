function StatCard({ valor, etiqueta, targetId }) {
  const handleClick = () => {
    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="col-12 col-md-4 mb-3">
      <div
        className="card border-0 shadow-sm h-100 stat-card"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <div className="card-body">
          <p className="fs-3 fw-bold text-primary mb-0">{valor}</p>
          <p className="text-secondary mb-0">{etiqueta}</p>
        </div>
      </div>
    </div>
  )
}

export default StatCard
