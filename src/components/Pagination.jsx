export default function Pagination({ paginaActual, totalPaginas, irPagina }) {
  if (totalPaginas <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination">
      <button 
        className="pagination-btn" 
        onClick={() => irPagina(paginaActual - 1)} 
        disabled={paginaActual === 1}
      >
        ◀ Anterior
      </button>
      
      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={idx} style={{ padding: '6px 10px', color: 'var(--gray-400)' }}>...</span>
        ) : (
          <button
            key={idx}
            className={`pagination-btn ${page === paginaActual ? 'active' : ''}`}
            onClick={() => irPagina(page)}
          >
            {page}
          </button>
        )
      ))}
      
      <button 
        className="pagination-btn" 
        onClick={() => irPagina(paginaActual + 1)} 
        disabled={paginaActual === totalPaginas}
      >
        Siguiente ▶
      </button>
    </div>
  );
}