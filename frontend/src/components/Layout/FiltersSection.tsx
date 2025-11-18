interface FiltersSectionProps {
  onSearchChange: (value: string) => void
  onSeverityChange: (value: string) => void
  onGroupChange: (value: string) => void
  onDateChange: (value: string) => void
  searchValue: string
  severityValue: string
  groupValue: string
  dateValue: string
}

function FiltersSection({
  onSearchChange,
  onSeverityChange,
  onGroupChange,
  onDateChange,
  searchValue,
  severityValue,
  groupValue,
  dateValue
}: FiltersSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
        
        <div className="flex items-center space-x-4">
          {/* Calendar Icon */}
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="search by alerts"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityValue}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Group Dropdown */}
          <select
            value={groupValue}
            onChange={(e) => onGroupChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Groups</option>
            <option value="A">Group A</option>
            <option value="B">Group B</option>
            <option value="C">Group C</option>
            <option value="D">Group D</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FiltersSection
