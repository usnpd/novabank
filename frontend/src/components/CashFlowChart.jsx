import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CashFlowChart = ({ historicalData = [], forecastedData = [] }) => {
  
  // Combine historical and forecasted data with a type flag
  const data = [
    ...historicalData.map(d => ({ ...d, type: 'Historical' })),
    ...forecastedData.map(d => ({ ...d, type: 'Forecast' }))
  ];

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    // Return MMM DD format
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        No cash flow data available. Projections will compile once transactions start logging.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#64748B" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={formatDate}
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={formatCurrency}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
            labelStyle={{ color: '#0F172A', fontWeight: 'bold', fontSize: '11px' }}
            itemStyle={{ fontSize: '11px' }}
            labelFormatter={(label) => `Date: ${formatDate(label)}`}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ fontSize: '11px', color: '#64748B' }}
          />
          <Area 
            type="monotone" 
            name="Inflow (Deposit)"
            dataKey="inflow" 
            stroke="#10B981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorInflow)" 
            dot={false}
          />
          <Area 
            type="monotone" 
            name="Outflow (Expense)"
            dataKey="outflow" 
            stroke="#EF4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorOutflow)" 
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
