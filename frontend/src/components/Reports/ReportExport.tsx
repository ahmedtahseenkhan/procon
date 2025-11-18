import { useState } from "react";

interface ReportExportProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "pdf" | "excel", options: ExportOptions) => void;
}

interface ExportOptions {
  dateRange: string;
  machineFilter: string;
  groupFilter: string;
  includeCharts: boolean;
  includeDetails: boolean;
}

function ReportExport({ isOpen, onClose, onExport }: ReportExportProps) {
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [options, setOptions] = useState<ExportOptions>({
    dateRange: "last30days",
    machineFilter: "all",
    groupFilter: "all",
    includeCharts: true,
    includeDetails: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format, options);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={(e) => setFormat(e.target.value as "pdf")}
                  className="mr-2"
                />
                <span className="text-sm">PDF</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={format === "excel"}
                  onChange={(e) => setFormat(e.target.value as "excel")}
                  className="mr-2"
                />
                <span className="text-sm">Excel</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={options.dateRange}
              onChange={(e) =>
                setOptions({ ...options, dateRange: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="lastyear">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Machine Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machine Filter
            </label>
            <select
              value={options.machineFilter}
              onChange={(e) =>
                setOptions({ ...options, machineFilter: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Machines</option>
              <option value="group-a">Group A</option>
              <option value="group-b">Group B</option>
              <option value="group-c">Group C</option>
              <option value="group-d">Group D</option>
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Filter
            </label>
            <select
              value={options.groupFilter}
              onChange={(e) =>
                setOptions({ ...options, groupFilter: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Groups</option>
              <option value="group-a">Group A</option>
              <option value="group-b">Group B</option>
              <option value="group-c">Group C</option>
              <option value="group-d">Group D</option>
            </select>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Report
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeCharts}
                  onChange={(e) =>
                    setOptions({ ...options, includeCharts: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm">Charts and Graphs</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeDetails}
                  onChange={(e) =>
                    setOptions({ ...options, includeDetails: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm">Detailed Transaction Data</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportExport;
