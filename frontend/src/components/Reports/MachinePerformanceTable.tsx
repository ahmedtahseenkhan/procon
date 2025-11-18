import { useState } from "react";
import CustomSelect from "../Layout/CustomSelect";

interface MachineData {
  id: string;
  name: string;
  uptime: string;
  efficiency: string;
  revenuePerDay: string;
  totalRevenue: string;
}

const machineData: MachineData[] = [
  {
    id: "M-001",
    name: "M-001",
    uptime: "98.5%",
    efficiency: "94%",
    revenuePerDay: "$283",
    totalRevenue: "$8,500",
  },
  {
    id: "M-002",
    name: "M-002",
    uptime: "92.5%",
    efficiency: "91%",
    revenuePerDay: "$207",
    totalRevenue: "$7,800",
  },
  {
    id: "M-003",
    name: "M-003",
    uptime: "93.5%",
    efficiency: "91%",
    revenuePerDay: "$222",
    totalRevenue: "$6,200",
  },
  {
    id: "M-004",
    name: "M-004",
    uptime: "98.5%",
    efficiency: "89%",
    revenuePerDay: "$267",
    totalRevenue: "$7,500",
  },
  {
    id: "M-005",
    name: "M-005",
    uptime: "93.5%",
    efficiency: "88%",
    revenuePerDay: "$255",
    totalRevenue: "$6,000",
  },
  {
    id: "M-006",
    name: "M-006",
    uptime: "97.5%",
    efficiency: "99%",
    revenuePerDay: "$200",
    totalRevenue: "$5,500",
  },
  {
    id: "M-007",
    name: "M-007",
    uptime: "96.5%",
    efficiency: "94%",
    revenuePerDay: "$303",
    totalRevenue: "$9,500",
  },
  {
    id: "M-008",
    name: "M-008",
    uptime: "88.5%",
    efficiency: "92%",
    revenuePerDay: "$221",
    totalRevenue: "$9,000",
  },
];

const groupOptions = [
  "All Machines",
  "Group A",
  "Group B",
  "Group C",
  "Group D",
];
const statusOptions = ["All Status", "Active", "Inactive", "Maintenance"];
const sortOptions = ["Name", "Uptime", "Efficiency", "Revenue"];

export default function MachinePerformanceTable() {
  const [selectedGroup, setSelectedGroup] = useState("All Machines");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("Name");

  return (
    <div className="animate-fade-in animate-slide-in-from-bottom-4">
      <div className="bg-white border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
        {/* Header with Filters */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
            Machine Performance
          </h3>
          <div className="flex items-center space-x-3">
            <CustomSelect
              options={groupOptions}
              value={selectedGroup}
              multiSelect={false}
              onChange={(val) => setSelectedGroup(val as string)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E6E6E6]">
                {[
                  "Name",
                  "Uptime",
                  "Efficiency",
                  "Revenue/Day",
                  "Total Revenue",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="min-w-[160px] px-4 py-3 text-left font-medium text-[rgba(28,32,36,1)] text-sm"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machineData.map((machine) => (
                <tr
                  key={machine.id}
                  className="border-b border-[#E6E6E6] hover:bg-gray-50 transition-colors"
                >
                  {[
                    machine.name,
                    machine.uptime,
                    machine.efficiency,
                    machine.revenuePerDay,
                    machine.totalRevenue,
                  ].map((value, idx) => (
                    <td
                      key={idx}
                      className="min-w-[160px] px-4 py-4 font-sans font-normal text-[14px] leading-[20px] tracking-[0.25px] text-[rgba(28,32,36,1)] text-left"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
