import { useState } from 'react';

export function usePagination(items, itemsPorPagina = 10) {
  const [paginaActual, setPaginaActual] = useState(1);
  
  const totalPaginas = Math.ceil(items.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const itemsPagina = items.slice(inicio, fin);
  
  const irPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };
  
  return { itemsPagina, paginaActual, totalPaginas, irPagina };
}