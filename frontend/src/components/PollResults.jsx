import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#7765DA', '#5767D0', '#4F0DCE', '#9B8CE8', '#6B5CE0', '#8A7DE8'];

const PollResults = ({ results }) => {
  const total = Object.values(results).reduce((sum, count) => sum + count, 0);
  
  const data = Object.entries(results).map(([option, count]) => ({
    option,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="option" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Results */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <motion.div
            key={item.option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-neutral-800">{item.option}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold text-neutral-800">{item.count} votes</div>
                <div className="text-sm text-neutral-600">{item.percentage}%</div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-neutral-600 border-t pt-4">
        Total Responses: {total}
      </div>
    </div>
  );
};

export default PollResults;
