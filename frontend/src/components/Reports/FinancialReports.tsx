import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../../services/api";
import { DeviceEvent } from "../../types";
import ReportExport from "./ReportExport";
import RunReportModal from "./RunReportModal";
import CustomSelect from "../Layout/CustomSelect";
import OverviewChart from "./OverviewChart";
import MachinePerformanceTable from "./MachinePerformanceTable";
import download from "../../assets/icons/download.svg";
import currency from "../../assets/icons/currency.svg";
import calculator from "../../assets/icons/calculator.svg";
import toolbox from "../../assets/icons/toolbox.svg";
import money from "../../assets/icons/money.svg";
const yearOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
interface FinancialStats {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

function FinancialReports() {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRunReportModal, setShowRunReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "performance">(
    "overview"
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEvents();
        setEvents(response.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const financialEvents = useMemo(() => {
    return events.filter(
      (e) => e.is_financial_event || e.event_id === "Money Added"
    );
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (timeRange === "all") return financialEvents;

    const now = new Date();
    const hoursAgo = parseInt(timeRange);

    return financialEvents.filter((event) => {
      const eventDate = new Date(event.event_timestamp);
      return eventDate >= new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    });
  }, [financialEvents, timeRange]);

  const stats: FinancialStats = useMemo(() => {
    const totalRevenue = filteredEvents.reduce(
      (acc, e) => acc + Number(e.parsed_amount || 0),
      0
    );
    const totalTransactions = filteredEvents.length;
    const averageTransaction =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = financialEvents
      .filter((e) => new Date(e.event_timestamp) >= today)
      .reduce((acc, e) => acc + Number(e.parsed_amount || 0), 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRevenue = financialEvents
      .filter((e) => new Date(e.event_timestamp) >= weekAgo)
      .reduce((acc, e) => acc + Number(e.parsed_amount || 0), 0);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyRevenue = financialEvents
      .filter((e) => new Date(e.event_timestamp) >= monthAgo)
      .reduce((acc, e) => acc + Number(e.parsed_amount || 0), 0);

    return {
      totalRevenue,
      totalTransactions,
      averageTransaction,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
    };
  }, [filteredEvents, financialEvents]);

  const handleExport = async (format: "pdf" | "excel", options: any) => {
    // TODO: Implement actual export functionality
    console.log("Exporting report:", format, options);
    // This would typically call an API endpoint to generate the report
    alert(
      `Exporting ${format.toUpperCase()} report with options: ${JSON.stringify(
        options
      )}`
    );
  };

  const recentTransactions = useMemo(() => {
    return filteredEvents
      .sort(
        (a, b) =>
          new Date(b.event_timestamp).getTime() -
          new Date(a.event_timestamp).getTime()
      )
      .slice(0, 10);
  }, [filteredEvents]);

  const deviceRevenue = useMemo(() => {
    const deviceMap = new Map<string, number>();
    filteredEvents.forEach((event) => {
      const current = deviceMap.get(event.device_id) || 0;
      deviceMap.set(
        event.device_id,
        current + (Number(event.parsed_amount) || 0)
      );
    });
    return Array.from(deviceMap.entries())
      .map(([deviceId, revenue]) => ({ deviceId, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
              Financial Performance Reports
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <CustomSelect
              options={yearOptions}
              value="Select Year"
              multiSelect={false}
              onChange={(val) => console.log("Selected:", val)}
            />
            <button
              onClick={() => setShowExportModal(true)}
              className="w-[149px] h-[40px] px-[15px] border rounded-md flex items-center gap-3 
             text-[rgba(96,100,108,1)] font-medium text-sm 
             border-[rgba(0,8,48,0.27)] hover:bg-gray-50"
            >
              <img src={download} alt="" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={() => setShowRunReportModal(true)}
              className="px-4 py-2 bg-[rgba(48,164,108,1)] text-white rounded-lg hover:bg-[rgba(38,140,92,1)] flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Run New Report</span>
            </button>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Total Revenue
              </h3>
              <div className="flex items-center space-x-2">
                <img src={currency} alt="" />
              </div>
            </div>
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle my-3">
              $125,430
            </div>
            <div className="flex items-center">
              <span className=" flex items-center justify-center text-[12px] font-medium text-[rgba(10,191,82,1)] bg-[rgba(239,253,244,1)] rounded-[8px] px-[10px] py-[4px]">
                +12.5%
              </span>
              <span className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
                $2.840/hr
              </span>
            </div>
          </div>

          {/* Average Payout Rate Card */}
          <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Average Payout Rate
              </h3>
              <div className="flex items-center space-x-2">
                <img src={calculator} alt="" />
              </div>
            </div>
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle my-3">
              73.2%
            </div>
            <div className="flex items-center">
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                -2.1%
              </span>
              <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
                vs last month
              </div>
            </div>
          </div>

          {/* Cash Flow Card */}
          <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Cash Flow
              </h3>
              <div className="space-x-1">
                <img src={money} alt="" />
              </div>
            </div>
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle my-3">
              $45,320
            </div>

            <div className="flex items-center">
              <span className=" flex items-center justify-center text-[12px] font-medium text-[rgba(10,191,82,1)] bg-[rgba(239,253,244,1)] rounded-[8px] px-[10px] py-[4px]">
                +8.7%
              </span>
              <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
                net positive
              </div>
            </div>
          </div>

          {/* Transaction Volume Card */}
          <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Transaction Volume
              </h3>
              <div className="space-x-1">
                <img src={toolbox} alt="" />
              </div>
            </div>
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle my-3">
              12,847
            </div>

            <div className="flex items-center">
              <span className=" flex items-center justify-center text-[12px] font-medium text-[rgba(10,191,82,1)] bg-[rgba(239,253,244,1)] rounded-[8px] px-[10px] py-[4px]">
                +15.3%
              </span>
              <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
                transactions
              </div>
            </div>
          </div>
        </div>

        {/* Machine Performance Section */}

        <div className="inline-flex items-center gap-2 bg-[rgba(244,244,245,1)] p-1.5 rounded-[12px]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-base font-normal rounded-[12px] transition-colors ${
              activeTab === "overview"
                ? "bg-white text-[rgba(17,17,17,1)]"
                : "bg-transparent text-[rgba(113,113,130,1)] hover:bg-white hover:text-[rgba(17,17,17,1)]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-2 text-base font-normal rounded-[12px] transition-colors ${
              activeTab === "performance"
                ? "bg-white text-[rgba(17,17,17,1)]"
                : "bg-transparent text-[rgba(113,113,130,1)] hover:bg-white hover:text-[rgba(17,17,17,1)]"
            }`}
          >
            Machine Performance
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewChart />}
        {activeTab === "performance" && <MachinePerformanceTable />}
        {/* <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4"></div>
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Machine Performance
            </h3>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>All Machines</option>
              <option>Group A</option>
              <option>Group B</option>
              <option>Group C</option>
              <option>Group D</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Uptime
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Efficiency
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Revenue/Day
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Total Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-001</td>
                <td className="py-3 px-4">98.5%</td>
                <td className="py-3 px-4">94%</td>
                <td className="py-3 px-4">$283</td>
                <td className="py-3 px-4">$8,500</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-002</td>
                <td className="py-3 px-4">92.5%</td>
                <td className="py-3 px-4">91%</td>
                <td className="py-3 px-4">$207</td>
                <td className="py-3 px-4">$7,800</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-003</td>
                <td className="py-3 px-4">93.5%</td>
                <td className="py-3 px-4">91%</td>
                <td className="py-3 px-4">$222</td>
                <td className="py-3 px-4">$6,200</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-004</td>
                <td className="py-3 px-4">98.5%</td>
                <td className="py-3 px-4">89%</td>
                <td className="py-3 px-4">$267</td>
                <td className="py-3 px-4">$7,500</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-005</td>
                <td className="py-3 px-4">93.5%</td>
                <td className="py-3 px-4">88%</td>
                <td className="py-3 px-4">$255</td>
                <td className="py-3 px-4">$6,000</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-006</td>
                <td className="py-3 px-4">97.5%</td>
                <td className="py-3 px-4">99%</td>
                <td className="py-3 px-4">$200</td>
                <td className="py-3 px-4">$5,500</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-007</td>
                <td className="py-3 px-4">96.5%</td>
                <td className="py-3 px-4">94%</td>
                <td className="py-3 px-4">$303</td>
                <td className="py-3 px-4">$9,500</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">M-008</td>
                <td className="py-3 px-4">88.5%</td>
                <td className="py-3 px-4">92%</td>
                <td className="py-3 px-4">$221</td>
                <td className="py-3 px-4">$9,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}

        {/* Revenue Breakdown */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today</span>
              <span className="font-medium">
                ${stats.todayRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="font-medium">
                ${stats.weeklyRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-medium">
                ${stats.monthlyRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">All Time</span>
              <span className="font-medium">
                ${stats.totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Devices
          </h3>
          <div className="space-y-3">
            {deviceRevenue.length === 0 ? (
              <p className="text-sm text-gray-500">No revenue data available</p>
            ) : (
              deviceRevenue.map((device, index) => (
                <div
                  key={device.deviceId}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-gray-900">
                      {device.deviceId}
                    </span>
                  </div>
                  <span className="font-medium">
                    ${device.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="font-medium">{stats.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Value</span>
              <span className="font-medium">
                ${stats.averageTransaction.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-medium">
                ${stats.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Revenue per Transaction
              </span>
              <span className="font-medium">
                ${stats.averageTransaction.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div> */}

        {/* Recent Transactions */}
        {/* <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction, index) => (
                  <tr key={transaction.event_uuid || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.event_timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.device_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.event_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(Number(transaction.parsed_amount) || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.is_acknowledged
                            ? "status-online"
                            : "status-warning"
                        }`}
                      >
                        {transaction.is_acknowledged ? "Processed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div> */}
      </div>
      {/* Report Export Modal */}
      <ReportExport
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      {/* Run Report Modal */}
      <RunReportModal
        isOpen={showRunReportModal}
        onClose={() => setShowRunReportModal(false)}
      />
    </>
  );
}

export default FinancialReports;
