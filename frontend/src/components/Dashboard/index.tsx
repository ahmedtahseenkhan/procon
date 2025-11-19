import { useEffect, useMemo, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { getDevices, getEvents } from "../../services/api";
import { Device, DeviceEvent } from "../../types";
import CustomSelect from "../Layout/CustomSelect";
import TailwindDatepicker from "../Alerts/DatePicker";
import currency from "../../assets/icons/currency.svg";
import joystick from "../../assets/icons/joystick.svg";
import shape from "../../assets/icons/shape.svg";
import Warning from "../../assets/icons/Warning.svg";
import search from "../../assets/icons/search.svg";

interface DashboardStats {
  totalRevenue: number;
  activeMachines: number;
  activeAlerts: number;
  livePlayers: number;
  revenueChange: number;
  machineChange: number;
  alertChange: number;
  playerChange: number;
}

interface AlertFilters {
  severity: string;
  eventType: string;
  deviceId: string;
  dateRange: string;
}

type GroupStats = {
  name: string;
  color: "green" | "orange" | "red";
  alerts: number;
  machines: number;
  uptime: number;
  revenue: number;
  critical: number;
  warning: number;
  maintenance: number;
  lat: number | null;
  lon: number | null;
};

const severityOptions = ["All Severities", "Critical", "High", "Medium", "Low"];
const groupOptions = ["All Groups", "Group A", "Group B", "Group C", "Group D"];
const timeOptions = ["Today", "7d", "30d"];
const months = ["January", "February", "March", "September"];

const DEFAULT_CENTER = { lat: 35.2271, lng: -80.8431 };

function Dashboard() {
  // Main state
  const [devices, setDevices] = useState<Device[]>([]);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeMachines: 0,
    activeAlerts: 0,
    livePlayers: 0,
    revenueChange: 0,
    machineChange: 0,
    alertChange: 0,
    playerChange: 0,
  });

  // Dropdown states
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedGroup, setSelectedGroup] = useState("D");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedTime, setSelectedTime] = useState("7d");
  const [searchValue, setSearchValue] = useState("");

  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Memoized and derived data
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(b.event_timestamp).getTime() -
          new Date(a.event_timestamp).getTime()
      ),
    [events]
  );

  const severityByDevice = useMemo(() => {
    const result: Record<string, "normal" | "warning" | "critical"> = {};
    for (const ev of sortedEvents) {
      const key = ev.device_id || ev.imei || ev.serial_number;
      if (!key || result[key]) continue;
      if (ev.severity === "critical") result[key] = "critical";
      else if (ev.severity === "warning") result[key] = "warning";
      else result[key] = "normal";
    }
    return result;
  }, [sortedEvents]);

  const deviceByKey = useMemo(() => {
    const map: Record<string, Device> = {};
    for (const d of devices) {
      if (d.device_id) map[d.device_id] = d;
      if (d.imei) map[d.imei] = d;
      if (d.serial_number) map[d.serial_number] = d;
    }
    return map;
  }, [devices]);

  const severityCounts = useMemo(() => {
    const counts = { normal: 0, warning: 0, critical: 0 };
    for (const d of devices) {
      const key = d.device_id || d.imei || d.serial_number;
      const sev =
        key && severityByDevice[key] ? severityByDevice[key] : "normal";
      counts[sev] += 1;
    }
    return counts;
  }, [devices, severityByDevice]);

  const mapCenter = useMemo(() => {
    const coords = devices.filter((d) => d.lat != null && d.lon != null);
    if (coords.length === 0) return DEFAULT_CENTER;
    const sum = coords.reduce(
      (acc, d) => ({
        lat: acc.lat + Number(d.lat),
        lng: acc.lng + Number(d.lon),
      }),
      { lat: 0, lng: 0 }
    );
    return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
  }, [devices]);

  const groupStats = useMemo<GroupStats[]>(() => {
    const groups = new Map<string, any>();
    const ensureGroup = (name: string) => {
      const key = name || "Ungrouped";
      if (!groups.has(key)) {
        groups.set(key, {
          devices: [],
          alerts: 0,
          critical: 0,
          warning: 0,
          maintenance: 0,
          online: 0,
          revenue: 0,
          latSum: 0,
          lonSum: 0,
          coordsCount: 0,
        });
      }
      return groups.get(key)!;
    };

    devices.forEach((d) => {
      const g = ensureGroup(d.group_name || "Ungrouped");
      g.devices.push(d);
      if (d.is_online) g.online += 1;
      const lat = Number(d.lat),
        lon = Number(d.lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        g.latSum += lat;
        g.lonSum += lon;
        g.coordsCount += 1;
      }
    });

    events.forEach((ev) => {
      const key = ev.device_id || ev.imei || ev.serial_number;
      if (!key) return;
      const dev = deviceByKey[key];
      const g = ensureGroup(dev?.group_name || "Ungrouped");
      g.alerts += 1;
      if (ev.severity === "critical") g.critical += 1;
      else if (ev.severity === "warning" || ev.severity === "high")
        g.warning += 1;
      if (ev.category === "maintenance") g.maintenance += 1;
      if (ev.is_financial_event && typeof ev.parsed_amount === "number")
        g.revenue += ev.parsed_amount;
    });

    const result: GroupStats[] = [];
    groups.forEach((g, name) => {
      const machines = g.devices.length;
      const uptime = machines ? (g.online / machines) * 100 : 0;
      let color: "green" | "orange" | "red" = "green";
      if (name === "Group A") color = "orange";
      else if (name === "Group B") color = "red";
      else if (name === "Group D") color = "red";

      const lat = g.coordsCount > 0 ? g.latSum / g.coordsCount : null;
      const lon = g.coordsCount > 0 ? g.lonSum / g.coordsCount : null;

      result.push({
        name,
        color,
        alerts: g.alerts,
        machines,
        uptime,
        revenue: g.revenue,
        critical: g.critical,
        warning: g.warning,
        maintenance: g.maintenance,
        lat,
        lon,
      });
    });
    return result.sort((a, b) => b.alerts - a.alerts);
  }, [devices, events, deviceByKey]);

  const selectedGroupStats = useMemo(
    () => groupStats.find((g) => g.name === selectedGroup) || null,
    [groupStats, selectedGroup]
  );

  const groupMarkerIcon = (g: GroupStats): google.maps.Symbol => {
    const fillColor =
      g.color === "red"
        ? "#FF3B30"
        : g.color === "orange"
        ? "#F59E0B"
        : "#22C55E";
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 22,
      fillColor,
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 3,
    };
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (groupStats.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      groupStats.forEach(
        (g) =>
          g.lat != null &&
          g.lon != null &&
          bounds.extend({ lat: g.lat, lng: g.lon })
      );
      if (!bounds.isEmpty()) map.fitBounds(bounds);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, eventsRes] = await Promise.all([
          getDevices(),
          getEvents(),
        ]);
        const devicesData = devicesRes.devices || [];
        const eventsData = eventsRes.events || [];
        setDevices(devicesData);
        setEvents(eventsData);

        const activeMachines = devicesData.filter(
          (d: Device) => d.is_online
        ).length;
        const activeAlerts = eventsData.filter(
          (e: DeviceEvent) => e.severity === "critical" || e.severity === "high"
        ).length;
        const totalRevenue = eventsData
          .filter((e: DeviceEvent) => e.is_financial_event)
          .reduce(
            (sum: number, e: DeviceEvent) =>
              sum + (Number(e.parsed_amount) || 0),
            0
          );
        const livePlayers = Math.floor(Math.random() * 2000) + 1500;

        setStats({
          totalRevenue,
          activeMachines,
          activeAlerts,
          livePlayers,
          revenueChange: 12.5,
          machineChange: 3,
          alertChange: -8,
          playerChange: 12.7,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Common dropdown style
  const dropdownBtnClass = `w-full px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`;
  const dropdownContainerClass = `w-[160px]`;

  return (
    <div className="space-y-6">
      {/* Main Dashboard Cards - Your existing code remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 ">
        {/* Total Revenue Card */}
        <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-4 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between space-x-2 ">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Total Revenue
              </h3>
              <span className="flex items-center justify-center text-[12px] font-medium text-[rgba(10,191,82,1)] bg-[rgba(239,253,244,1)] rounded-[8px] px-[10px] py-[4px]">
                +{stats.revenueChange}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <img src={currency} alt="" />
            </div>
          </div>

          <div className="flex items-center space-x-2 my-3">
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em]  ">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(stats.totalRevenue)}
            </div>
            <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
              }).format(stats.totalRevenue / (30 * 24))}
              /hr
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[12px] text-[rgba(10,10,10,1)]">
              Month:
            </span>
            <CustomSelect
              options={months}
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val as string)}
              buttonClassName={`px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`}
              optionsClassName="w-[170px]"
              containerClassName=""
            />
          </div>
        </div>

        {/* Active Machines Card */}
        <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-4 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between space-x-2 ">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Active Machines
              </h3>
              <span className=" flex items-center justify-center text-[12px] font-medium text-[rgba(10,191,82,1)] bg-[rgba(239,253,244,1)] rounded-[8px] px-[10px] py-[4px]">
                +{stats.machineChange}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <img src={joystick} alt="" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle my-3">
              {stats.activeMachines}
            </div>
            <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
              99.2% uptime
            </div>
          </div>
          <div className="flex items-center space-x-3 ">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[12px]">Time:</span>
              <CustomSelect
                options={timeOptions}
                value={selectedTime}
                onChange={(val) => setSelectedTime(val as string)}
                buttonClassName={`px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`}
                optionsClassName="w-[170px]"
                containerClassName=""
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[12px]">Group:</span>
              <CustomSelect
                options={groupOptions}
                value={selectedGroup}
                onChange={(val) => setSelectedGroup(val as string)}
                buttonClassName={`px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`}
                optionsClassName="w-[170px]"
                containerClassName=""
              />
            </div>
          </div>
        </div>
        {/* Active Alerts Card */}
        <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-4 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between space-x-2 ">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em]">
                Active Alerts
              </h3>
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                {stats.alertChange}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <img src={Warning} alt="" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle my-3">
              {stats.activeAlerts}
            </div>
            <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
              3 critical
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[12px]">Group:</span>
              <CustomSelect
                options={groupOptions}
                value={selectedGroup}
                onChange={(val) => setSelectedGroup(val as string)}
                buttonClassName={`px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`}
                optionsClassName="w-[170px]"
                containerClassName=""
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[12px]">Severity:</span>
              <CustomSelect
                options={severityOptions}
                value={selectedSeverity}
                onChange={(val) => setSelectedSeverity(val as string)}
                containerClassName=""
                buttonClassName={`px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`}
                optionsClassName="w-[170px]"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-[12px]">Time:</span>
              <CustomSelect
                options={timeOptions}
                value={selectedTime}
                onChange={(val) => setSelectedTime(val as string)}
                containerClassName=""
                buttonClassName={`px-0 py-0 text-[12px] font-semibold text-[rgba(10,10,10,1)] text-left flex justify-between items-center outline-none bg-transparent border-none space-x-1`}
                optionsClassName="w-[170px]"
              />
            </div>
          </div>
        </div>
        {/* Live Players Card */}
        <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-4 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between space-x-2 ">
              <h3 className="text-[16px] font-semibold text-[rgba(113,113,130,1)] leading-[100%] tracking-[-0.02em] ">
                Live Players
              </h3>
              <span className=" flex items-center justify-center text-[12px] font-medium text-[rgba(10,191,82,1)] bg-[rgba(239,253,244,1)] rounded-[8px] px-[10px] py-[4px]">
                +{stats.machineChange}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <img src={shape} alt="" />
            </div>
          </div>
          <div className="flex items-center space-x-2 my-3">
            <div className="text-[22px] font-semibold text-[rgba(10,10,10,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] ">
              {stats.livePlayers.toLocaleString()}
            </div>
            <div className="text-[14px] font-normal text-[rgba(113,113,130,1)]  ml-2">
              +23 joins/min
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center rounded-lg border border-[rgba(230,230,230,1)] bg-[rgba(254,254,254,1)] p-5">
        <h3 className="text-[18px] font-medium leading-[100%] tracking-[-0.02em] text-gray-900">
          Filters & Search
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TailwindDatepicker />
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
            options={groupOptions}
            firstOption="All Clusters"
            multiSelect={true}
            onChange={(selected) => console.log("Selected:", selected)}
          />
        </div>
      </div>

      {/* Gaming Machine Group Map Section - UPDATED */}
      <div className="bg-[#FEFEFE] border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-[rgba(17,17,17,1)] leading-[100%] tracking-[-0.02em] font-['DM_Sans'] align-middle">
            Gaming Machine Group Map
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center ">
              <div className="w-3 h-3 bg-[rgba(52,199,89,1)] rounded-full"></div>
              <div className="ml-2">
                <span className="text-[16px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)]">
                  Normal
                </span>
                <p className="text-[14px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)] opacity-50">
                  {severityCounts.normal} devices
                </p>
              </div>
            </div>
            <div className="flex items-center ">
              <div className="w-3 h-3 bg-[rgba(245,158,12,1)] rounded-full"></div>
              <div className="ml-2">
                <span className="text-[16px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)]">
                  Warning
                </span>
                <p className="text-[14px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)] opacity-50">
                  {severityCounts.warning} devices
                </p>
              </div>
            </div>
            <div className="flex items-center ">
              <div className="w-3 h-3 bg-[rgba(255,0,0,1)] rounded-full"></div>
              <div className="ml-2">
                <span className="text-[16px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)]">
                  Critical
                </span>
                <p className="text-[14px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)] opacity-50">
                  {severityCounts.critical} devices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-[171px]  bg-[rgba(244,244,245,1)] p-[4px] rounded-[12px]">
              <button className="px-[15px] h-[40px] bg-white text-[rgba(17,17,17,1)]  text-[16px] font-normal rounded-[12px]  transition-colors">
                Map
              </button>
              <button className="px-[15px] bg-transparent h-[40px] text-[rgba(113,113,130,1)] text-[16px] font-normal  rounded-[12px]  hover:bg-white hover:text-[rgba(17,17,17,1)] transition-colors">
                Satellite
              </button>
            </div>
          </div>
        </div>

        {/* Map with overlays */}
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          {/* Search icon (top-left) */}
          <div className="absolute top-3 left-3 bg-white border border-gray-200 rounded-lg p-2 shadow-sm z-10">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {selectedGroupStats && (
            <div className="absolute top-16 left-3 bg-[rgba(254,254,254,1)] border border-[rgba(230,230,230,1)] rounded-[8px] shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)] p-[24px] min-w-[220px] z-10">
              <div className="flex items-center mb-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    selectedGroupStats.color === "red"
                      ? "bg-red-500"
                      : selectedGroupStats.color === "orange"
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                ></div>
                <span className="ml-2 text-[16px] font-semibold text-[rgba(28,32,36,1)]">
                  {selectedGroupStats.name} Stats
                </span>
              </div>
              <div className="space-y-2 text-[14px] text-[rgba(28,32,36,1)]">
                <div className="flex justify-between">
                  <span>Machines:</span>
                  <span>{selectedGroupStats.machines}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{selectedGroupStats.uptime.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span>
                    {selectedGroupStats.revenue.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Legend (bottom-left) */}
          <div className="absolute bottom-3 z-10 left-3  bg-[rgba(254,254,254,1)] border border-[rgba(230,230,230,1)] rounded-[8px] shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)] p-[24px]">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {groupStats.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setSelectedGroup(g.name)}
                  className="flex items-center text-left"
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      g.color === "red"
                        ? "bg-red-500"
                        : g.color === "orange"
                        ? "bg-yellow-400"
                        : "bg-green-500"
                    }`}
                  ></span>
                  <div className="ml-4">
                    <span className="text-[16px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)]">
                      {g.name}
                    </span>
                    <p className="text-[14px] leading-[100%] tracking-[-0.02em] text-[rgba(28,32,36,1)] opacity-50">
                      {g.alerts} Alerts
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Google Map - UPDATED */}
          <div className="absolute inset-0">
            {!isLoaded ? (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={6}
                onLoad={onMapLoad}
                options={{
                  disableDefaultUI: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  minZoom: 3,
                  maxZoom: 18,
                }}
              >
                {groupStats.map((g) => {
                  if (g.lat === null || g.lon === null) return null;
                  return (
                    <Marker
                      key={g.name}
                      position={{ lat: g.lat, lng: g.lon }}
                      icon={groupMarkerIcon(g)}
                      label={{
                        text: String(g.alerts),
                        color: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                      onClick={() => setSelectedGroup(g.name)}
                    />
                  );
                })}
              </GoogleMap>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
