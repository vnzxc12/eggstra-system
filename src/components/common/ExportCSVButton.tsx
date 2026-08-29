'use client';

// ==============================================================================
// Eggstra - Reusable CSV Exporter Component
// ==============================================================================

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExportCSVButtonProps {
  filename: string;
  data: Record<string, any>[];
  label?: string;
  className?: string;
}

export const ExportCSVButton: React.FC<ExportCSVButtonProps> = ({
  filename,
  data,
  label = 'Export CSV',
  className = '',
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Format rows
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            let val = row[header];
            if (val === null || val === undefined) val = '';
            // Escape quotes and commas
            const stringVal = String(val).replace(/"/g, '""');
            return `"${stringVal}"`;
          })
          .join(',')
      ),
    ];

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold shadow-sm transition-all cursor-pointer ${className}`}
      title="Download spreadsheet (CSV)"
    >
      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
      <span>{label}</span>
    </button>
  );
};
