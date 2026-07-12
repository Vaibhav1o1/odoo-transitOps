import React from 'react';
import { Skeleton } from './CommonUI';

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyState: EmptyState,
  onRowClick,
  rowKey = 'id',
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton variant="table" className="h-12 w-full" />
        <Skeleton variant="table" className="h-10 w-full" />
        <Skeleton variant="table" className="h-10 w-full" />
        <Skeleton variant="table" className="h-10 w-full" />
        <Skeleton variant="table" className="h-10 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return EmptyState ? (
      <div className="flex justify-center items-center py-12">{EmptyState}</div>
    ) : (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* DESKTOP & TABLET VIEW */}
      <div className="hidden sm:block overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850/50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3.5 text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-transparent">
            {data.map((row, rowIdx) => (
              <tr
                key={row[rowKey] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/30'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-850/10'
                }`}
              >
                {columns.map((col, colIdx) => {
                  const val = row[col.key];
                  return (
                    <td
                      key={colIdx}
                      className={`px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-200 ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE STACKED CARD VIEW (<640px) */}
      <div className="block sm:hidden space-y-4">
        {data.map((row, rowIdx) => (
          <div
            key={row[rowKey] || rowIdx}
            onClick={() => onRowClick && onRowClick(row)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-98 transition-transform"
          >
            <div className="flex flex-col space-y-3.5">
              {columns.map((col, colIdx) => {
                // By convention, we display the first column as a primary header
                const isHeader = colIdx === 0;
                const val = row[col.key];
                
                if (isHeader) {
                  return (
                    <div key={colIdx} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-sm font-bold text-slate-950 dark:text-slate-50">
                        {col.render ? col.render(row) : val}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={colIdx} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-400 dark:text-slate-450 uppercase tracking-wider">
                      {col.header}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">
                      {col.render ? col.render(row) : val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
