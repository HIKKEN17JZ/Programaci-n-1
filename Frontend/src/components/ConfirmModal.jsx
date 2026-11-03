function ConfirmModal({
  isOpen,
  titulo = 'Confirmar acción',
  mensaje = '¿Estás seguro de que deseas realizar esta acción?',
  confirmTexto = 'Eliminar',
  confirmClase = 'btn-danger',
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-light py-3 px-4 rounded-top-4">
            <h5 className="modal-title fw-bold text-dark">{titulo}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar modal"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body p-4 text-secondary">
            <p className="mb-0">{mensaje}</p>
          </div>

          <div className="modal-footer bg-light px-4 py-3 rounded-bottom-4">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`btn ${confirmClase} btn-sm px-4 fw-semibold`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Procesando...
                </>
              ) : (
                confirmTexto
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
