import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TransactionChart = ({ transactions = [] }) => {
  
  // Aggregate debit spending by category
  const debits = transactions.filter(t => t.transactionType === 'DEBIT');
  
  const categoriesMap = {};
  debits.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + Number(t.amount);
  });

  const chartData = Object.keys(categoriesMap).map(cat => ({
    name: cat,
    amount: Number(categoriesMap[cat].toFixed(2))
  })).sort((a, b) => b.amount - a.amount);

  // Custom colors for categories
  const COLORS = ['#3B82F6', '#818CF8', '#A78BFA', '#F472B6', '#FB7185', '#F59E0B', '#10B981', '#14B8A6'];

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        No spending data to display. Start making debit transactions!
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="#64748B" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
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
            itemStyle={{ color: '#3B82F6', fontSize: '11px' }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spending']}
          />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;
