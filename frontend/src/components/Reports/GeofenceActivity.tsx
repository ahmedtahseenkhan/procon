import { useNavigate } from "react-router-dom";
import MachinePerformanceTable from "./MachinePerformanceTable";
import DatePicker from "../Alerts/DatePicker";
import search from "../../assets/icons/search.svg";
import CustomSelect from "../Layout/CustomSelect";
import download from "../../assets/icons/download.svg";
const severityOptions = ["All Severities", "Critical", "High", "Medium", "Low"];
const clustersOptions = ["Group A", "Group B", "Group C", "Group D"];

function GeofenceActivity() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header with Back Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate("/reports")}
            className="w-10 h-10 p-2 rounded-md border border-[rgba(224,224,224,1)] flex items-center justify-center cursor-pointer"
            aria-label="Back to Reports"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-black"
            >
              <path
                fillRule="evenodd"
                d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em] text-gray-900">
            Geofence Activity
          </h1>
        </div>
        <button
          // onClick={() => setShowExportModal(true)}
          className="w-[149px] h-[40px] px-[15px] border rounded-md flex items-center gap-3 
             text-[rgba(96,100,108,1)] font-medium text-sm 
             border-[rgba(0,8,48,0.27)] hover:bg-gray-50"
        >
          <img src={download} alt="" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Filters & Search Section */}
      <div className="flex justify-between items-center rounded-lg border border-[rgba(230,230,230,1)] bg-[rgba(254,254,254,1)] p-5">
        <h3 className="text-[18px] font-medium leading-[100%] tracking-[-0.02em] text-gray-900">
          Filters & Search
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DatePicker />
            <div className="relative w-[231px]">
              <img
                src={search}
                alt="search"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="text"
                placeholder="search by alerts"
                className="w-full h-[40px] pl-10 pr-4 py-2 rounded border border-[rgba(235,235,235,1)] bg-white outline-none focus:outline-none focus:ring-0 focus:border-[rgba(235,235,235,1)] text-sm"
              />
            </div>
          </div>
          <CustomSelect
            options={severityOptions}
            value="All Severities"
            multiSelect={false}
            onChange={(val) => console.log("Selected:", val)}
          />

          <CustomSelect
            options={clustersOptions}
            firstOption="All Clusters"
            multiSelect={true}
            onChange={(selected) => console.log("Selected:", selected)}
          />
        </div>
      </div>

      {/* Machine Performance Table */}
      <MachinePerformanceTable />
    </div>
  );
}

export default GeofenceActivity;
