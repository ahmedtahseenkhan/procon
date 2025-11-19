import { useEffect, useState, useMemo } from "react";
import { getEvents, getDevices } from "../../services/api";
import { DeviceEvent } from "../../types";
import AlertDetailModal from "./AlertDetailModal";
import searchIcon from "../../assets/icons/search.svg";
import DatePicker from "./DatePicker";
import arrowright from "../../assets/icons/arrowright.svg";
import {
  getEventTypeConfig,
  getSeverityColor,
  getCategoryColor,
  getEventIcon,
} from "../../utils/eventTypes";
import CustomSelect from "../Layout/CustomSelect";

interface AlertFilters {
  severity: string;
  eventType: string;
  deviceId: string;
  dateRange: string;
}
const severityOptions = ["All Severities", "Critical", "Maintenance", "Warning", "Normal"];
const clustersOptions = ["Group A", "Group B", "Group C", "Group D"];

function AlertFeed() {
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [devicesMap, setDevicesMap] = useState<Record<string, { group_name?: string; nickname?: string }>>({});
  const [search, setSearch] = useState("");
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filters, setFilters] = useState<AlertFilters>({
    severity: "all",
    eventType: "all",
    deviceId: "all",
    dateRange: "all",
  });
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<DeviceEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [evRes, devRes] = await Promise.all([getEvents(), getDevices()]);
        setEvents(evRes.events || []);
        const m: Record<string, { group_name?: string; nickname?: string }> = {};
        for (const d of (devRes.devices || [])) {
          const key = d.device_id || d.serial_number || d.imei;
          if (key) m[key] = { group_name: d.group_name, nickname: d.nickname };
        }
        setDevicesMap(m);
      } catch (error) {
        console.error("Error fetching events/devices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((e: any) => {
      const sev = String(e.severity || "").toLowerCase();
      const cat = String(e.category || "").toLowerCase();

      // Severity: maintenance uses category, others by severity (critical, warning, normal, etc.)
      if (filters.severity !== "all") {
        const filterSev = String(filters.severity || "").toLowerCase();
        if (filterSev === "maintenance") {
          if (cat !== "maintenance") return false;
        } else if (sev !== filterSev) {
          return false;
        }
      }

      // Cluster filter (selectedClusters empty = all)
      const machine = e.device_id || e.serial_number || e.imei;
      const cluster = String(devicesMap[machine]?.group_name || "").toLowerCase();
      const nickname = String(devicesMap[machine]?.nickname || "").toLowerCase();
      if (selectedClusters.length > 0) {
        if (!selectedClusters.map((c) => c.toLowerCase()).includes(cluster)) return false;
      }

      // Search: event_id (primary), plus machine / cluster / nickname
      if (term) {
        const machineStr = String(machine || "").toLowerCase();
        const eventIdStr = String(e.event_id ?? "").toLowerCase();
        if (
          !eventIdStr.includes(term) &&
          !machineStr.includes(term) &&
          !cluster.includes(term) &&
          !nickname.includes(term)
        ) {
          return false;
        }
      }

      // Date range (hours)
      if (filters.dateRange !== "all") {
        const dt = new Date(e.event_timestamp);
        const hours = parseInt(filters.dateRange);
        if (hours > 0 && dt < new Date(Date.now() - hours * 60 * 60 * 1000)) return false;
      }
      return true;
    });
  }, [events, filters, search, selectedClusters, devicesMap]);

  const totalPages = Math.max(Math.ceil(filteredEvents.length / pageSize), 1);
  const pageEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, page, pageSize]);

  const rowBgClass = (sev: string, cat?: string) => {
    const s = String(sev||'').toLowerCase();
    const c = String(cat||'').toLowerCase();
    if (s === 'critical') return 'bg-[rgba(254,236,237,1)]';
    if (c === 'maintenance') return 'bg-[rgba(250,245,255,1)]';
    if (s === 'warning' || s === 'high') return 'bg-[rgba(255,246,234,1)]';
    return 'bg-[rgba(237,250,241,1)]';
  };

  const timeAgo = (iso: string) => {
    const d = new Date(iso); const mins = Math.floor((Date.now()-d.getTime())/60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins/60); if (hrs < 24) return `${hrs} hr${hrs>1?'s':''} ago`;
    const days = Math.floor(hrs/24); return `${days} day${days>1?'s':''} ago`;
  };

  const severityCounts = useMemo(() => {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  const uniqueEventTypes = useMemo(() => {
    return [...new Set(events.map((e) => e.event_type))].sort();
  }, [events]);

  const uniqueDeviceIds = useMemo(() => {
    return [...new Set(events.map((e) => e.device_id))].sort();
  }, [events]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "severity-critical";
      case "high":
        return "severity-high";
      case "medium":
        return "severity-medium";
      case "low":
        return "severity-low";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "high":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const handleAlertClick = (event: DeviceEvent) => {
    setSelectedAlert(event);
    setShowModal(true);
  };

  const handleAcknowledge = async (eventId: string) => {
    // TODO: Implement acknowledge API call
    console.log("Acknowledging event:", eventId);
    // Update the event in the local state
    setEvents((prev) =>
      prev.map((e) =>
        e.event_id === eventId ? { ...e, is_acknowledged: true } : e
      )
    );
  };

  const handleResolve = async (eventId: string) => {
    // TODO: Implement resolve API call
    console.log("Resolving event:", eventId);
    // Remove the event from the local state
    setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
    setShowModal(false);
    setSelectedAlert(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
            Events & Alerts Management
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center gap-2 rounded-md  border border-[rgba(223,0,3,0.34)] bg-[rgba(255,0,0,0.03)] px-[10px] py-[6px] font-medium text-[14px] leading-none text-red-700">
            {(severityCounts.critical || 0)} Critical
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-[rgba(220,155,0,0.62)] bg-[rgba(244,209,0,0.09)] px-[10px] py-[6px] font-medium text-[14px] leading-none text-yellow-800">
            {(severityCounts.high || 0)} Warning
          </div>
        </div>
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
                src={searchIcon}
                alt="search"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
              />
              <input
                type="text"
                placeholder="search by alerts"
                className="w-full h-[40px] pl-10 pr-4 py-2 rounded border border-[rgba(235,235,235,1)] bg-white outline-none focus:outline-none focus:ring-0 focus:border-[rgba(235,235,235,1)] text-sm"
                value={search}
                onChange={(e)=>{ setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <CustomSelect
            options={severityOptions}
            value={filters.severity === 'all' ? 'All Severities' : (filters.severity === 'maintenance' ? 'Maintenance' : (filters.severity.charAt(0).toUpperCase()+filters.severity.slice(1)))}
            multiSelect={false}
            onChange={(val) => {
              const sel = Array.isArray(val) ? val[0] : val;
              const map: Record<string,string> = {
                'All Severities': 'all',
                'All': 'all',
                'Critical': 'critical',
                'Maintenance': 'maintenance',
                'Warning': 'warning',
                'Normal': 'normal',
              };
              setFilters((f)=>({ ...f, severity: map[sel] ?? 'all' }));
              setPage(1);
            }}
          />

          <CustomSelect
            options={clustersOptions}
            firstOption="All Clusters"
            multiSelect={true}
            value={selectedClusters}
            onChange={(selected) => {
              const v = Array.isArray(selected) ? selected : [selected];
              setSelectedClusters(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Live Alerts Table */}
      <div className="rounded-lg border border-[rgba(230,230,230,1)] shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)] bg-[rgba(254,254,254,1)] p-5">
        <h3 className="mb-3 text-[18px] font-medium leading-[100%] tracking-[-0.02em] text-gray-900">
          Live Alerts
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 py-3">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[248px] min-w-[160px] h-[48px] min-h-[44px] text-[14px] leading-[20px] tracking-[0.02em] font-[Inter]">
                  Machine Name
                </th>

                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[248px] min-w-[160px] h-[48px] min-h-[44px] text-[14px] leading-[20px] tracking-[0.02em] font-[Inter]">
                  Alert
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[248px] min-w-[160px] h-[48px] min-h-[44px] text-[14px] leading-[20px] tracking-[0.02em] font-[Inter]">
                  Cluster
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[248px] min-w-[160px] h-[48px] min-h-[44px] text-[14px] leading-[20px] tracking-[0.02em] font-[Inter]">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[248px] min-w-[160px] h-[48px] min-h-[44px] text-[14px] leading-[20px] tracking-[0.02em] font-[Inter]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageEvents.map((ev: any) => {
                const machine = ev.device_id || ev.serial_number || ev.imei;
                const cluster = devicesMap[machine]?.group_name || '-';
                const pill = ev.category && ev.category.toLowerCase() === 'maintenance' ? 'Maintenance' : (String(ev.severity||'').toUpperCase());
                return (
                  <tr key={ev.event_uuid || `${machine}-${ev.event_timestamp}`}
                      className={`w-full min-h-[72px] border-t border-[rgba(0,0,47,0.15)] py-2 ${rowBgClass(ev.severity, ev.category)}`}>
                    <td className="py-4 px-4 text-[16px] font-normal leading-[24px] tracking-[0.5px] text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{machine}</span>
                        {(() => { const sk = String(ev.severity||'').toLowerCase(); const sevForClass = sk === 'warning' ? 'high' : sk; return (
                        <span className={`px-[8px] py-[4px] rounded text-[10px] font-medium leading-[12px] tracking-[0.5px] ${getSeverityColor(sevForClass)}`}>
                          {pill}
                        </span> );})()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[16px] font-normal leading-[24px] tracking-[0.5px] text-gray-900">
                      {ev.event_id || ev.event_entry}
                    </td>
                    <td className="py-4 px-4 text-[16px] font-normal leading-[24px] tracking-[0.5px] text-gray-900">
                      {cluster}
                    </td>
                    <td className="py-4 px-4 text-[16px] font-normal leading-[24px] tracking-[0.5px] text-gray-900">
                      {timeAgo(ev.event_timestamp)}
                    </td>
                    <td className="py-4 px-4 text-[16px] font-normal leading-[24px] tracking-[0.5px] text-[#60646C]">
                      <a href="#" className="flex items-center space-x-1">
                        <span>See on Map</span>
                        <img src={arrowright} alt="" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAlert(null);
        }}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}

export default AlertFeed;
