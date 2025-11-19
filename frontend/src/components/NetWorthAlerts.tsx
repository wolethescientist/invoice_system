'use client';

import { useEffect, useState } from 'react';
import { getNetWorthAlerts, NetWorthAlert, formatCurrency, formatPercentage } from '@/lib/net-worth-api';

export default function NetWorthAlerts() {
  const [alerts, setAlerts] = useState<NetWorthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getNetWorthAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-24 rounded"></div>;
  }

  if (alerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`border-l-4 p-4 rounded ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start">
            <span className="text-2xl mr-3">{getSeverityIcon(alert.severity)}</span>
            <div className="flex-1">
              <p className="font-semibold">{alert.message}</p>
              {alert.change_amount !== undefined && (
                <p className="text-sm mt-1">
                  Change: {formatCurrency(alert.change_amount)}
                  {alert.change_percentage !== undefined && (
                    <span className="ml-1">({formatPercentage(alert.change_percentage)})</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
