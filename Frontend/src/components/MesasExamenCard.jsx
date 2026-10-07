function MesasExamenCard({ mesas }) {
  return (
    <div id="mesas-examen" className="col-12 col-md-4 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">Mesas de Examen</h5>
          <ul className="list-unstyled mb-3">
            {mesas.map((mesa) => (
              <li key={`${mesa.materia}-${mesa.fecha}`} className="d-flex justify-content-between align-items-center mb-2">
                <span className="me-2 text-break">{mesa.materia} — {mesa.llamado}</span>
                <span className={`badge ${mesa.nota === null ? 'text-bg-secondary' : 'text-bg-success'} text-nowrap`}>
                  {mesa.nota === null ? 'Pendiente' : `Nota ${mesa.nota}`}
                </span>
              </li>
            ))}
          </ul>
          <a href="#" className="btn btn-outline-primary btn-sm mt-auto" onClick={(e) => e.preventDefault()}>
            Ver más
          </a>
        </div>
      </div>
    </div>
  )
}

export default MesasExamenCard
