// src/utils/exportUtils.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exportar datos a Excel (.xlsx)
 * @param {Array} data - Array de objetos a exportar
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {string} sheetName - Nombre de la hoja (opcional)
 */
export const exportToExcel = (data, filename, sheetName = 'Reporte') => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * Exportar datos a CSV
 * @param {Array} data - Array de objetos a exportar
 * @param {string} filename - Nombre del archivo sin extensión
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }
  
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

/**
 * Exportar datos a JSON
 * @param {Array} data - Array de objetos a exportar
 * @param {string} filename - Nombre del archivo sin extensión
 */
export const exportToJSON = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};