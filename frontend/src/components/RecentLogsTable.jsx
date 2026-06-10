import React from 'react';
import { Calendar, Trash2, Compass, RefreshCw } from 'lucide-react';

export default function RecentLogsTable({ recentLogs, onDeleteLog, onRefresh, t }) {
  return (
    <div className="glass-card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '20px' }}>{t('recentLogs')}</h3>
        <button className="btn btn-secondary" onClick={onRefresh} style={{ padding: '6px 12px', fontSize: '12px' }}>
          <RefreshCw size={12} />
        </button>
      </div>

      {recentLogs && recentLogs.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Transportation</th>
                <th style={{ padding: '12px' }}>Electricity</th>
                <th style={{ padding: '12px' }}>Diet</th>
                <th style={{ padding: '12px' }}>Waste</th>
                <th style={{ padding: '12px' }}>Total (CO2e)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.02)', fontSize: '14px' }}>
                  <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      {log.date}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {log.transportDistance > 0 ? (
                      <span>{t(log.transportType.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))} ({log.transportDistance} km)</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {log.electricityKwh > 0 ? (
                      <span>{log.electricityKwh} kWh ({t(log.electricityType)})</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span>{t(log.foodHabit)}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {log.wasteWeight > 0 ? (
                      <span>{log.wasteWeight} kg ({t(log.wasteType)})</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--danger)' }}>
                    {log.total} kg
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onDeleteLog(log.id)}
                      style={{ background: 'transparent', padding: '6px', color: 'var(--danger)' }}
                      title="Delete log"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Compass size={36} style={{ marginBottom: '12px', strokeWidth: 1.5 }} />
          <p>{t('noData')}</p>
        </div>
      )}
    </div>
  );
}
