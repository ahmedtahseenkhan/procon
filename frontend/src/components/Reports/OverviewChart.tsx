import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import CustomSelect from "../Layout/CustomSelect";
import { useState } from "react";

const extendedData = [
  { name: "1/1/2024", monthlyIn: 4000, monthlyOut: 2400 },
  { name: "1/2/2024", monthlyIn: 3000, monthlyOut: 1398 },
  { name: "1/3/2024", monthlyIn: 2000, monthlyOut: 9800 },
  { name: "1/4/2024", monthlyIn: 2780, monthlyOut: 3908 },
  { name: "1/5/2024", monthlyIn: 1890, monthlyOut: 4800 },
  { name: "1/6/2024", monthlyIn: 2390, monthlyOut: 3800 },
  { name: "1/7/2024", monthlyIn: 3490, monthlyOut: 4200 },
  { name: "1/8/2024", monthlyIn: 3200, monthlyOut: 3600 },
];
const revenueData = [
  { name: "Jan", profit: 50000, revenue: 70000 },
  { name: "Feb", profit: 45000, revenue: 65000 },
  { name: "Mar", profit: 55000, revenue: 75000 },
  { name: "Apr", profit: 60000, revenue: 80000 },
  { name: "May", profit: 65000, revenue: 85000 },
  { name: "Jun", profit: 70000, revenue: 90000 },
];
const dataFilter = ["This Week", "This Month", "This Year"];
export default function OverviewChart() {
  const [selectedGroup, setSelectedGroup] = useState("This Week");
  return (
    <div className="space-y-6 animate-fade-in animate-slide-in-from-bottom-4">
      {/* Bar Chart */}
      {/* <div className="bg-white border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
            332 Hug x 40 Hug
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">This Week</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E6E6E6",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="monthlyIn" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="monthlyOut" fill="#EF4444" radius={[8, 8, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div> */}

      {/* Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6  animate-fade-in animate-slide-in-from-bottom-4">
        <div className="bg-white border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
              Daily Cash Flow
            </h3>
            <div className="flex items-center space-x-2">
              <CustomSelect
                options={dataFilter}
                value={selectedGroup}
                multiSelect={false}
                onChange={(val) => setSelectedGroup(val as string)}
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={extendedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              barGap={2}
              barCategoryGap="-10%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E6E6E6",
                  borderRadius: "8px",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Bar
                dataKey="monthlyOut"
                stackId="a"
                fill="#E28B88"
                barSize={20} // thin bars
              />
              <Bar
                dataKey="monthlyIn"
                stackId="a"
                fill="#5BB98C"
                barSize={20} // thin bars
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
              Revenue Trend
            </h3>
            <div className="flex items-center space-x-2">
              <CustomSelect
                options={dataFilter}
                value={selectedGroup}
                multiSelect={false}
                onChange={(val) => setSelectedGroup(val as string)}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E6E6E6",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={{ fill: "#06B6D4", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ fill: "#A855F7", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* <div className="bg-white border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
              Performance Metrics
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">This Week</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6E6" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E6E6E6",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="profit" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>
    </div>
  );
}
