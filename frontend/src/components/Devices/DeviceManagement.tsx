import { useEffect, useState, useMemo } from "react";
import { getDevices, getEvents } from "../../services/api";
import { Device, DeviceEvent } from "../../types";
import MFAConfirmation from "../Common/MFAConfirmation";
import MachineDetailDrawer from "./MachineDetailDrawer";
import CustomSelect from "../Layout/CustomSelect";
import thermometer from "../../assets/icons/thermometer.svg";
import thermometeryellow from "../../assets/icons/thermometeryellow.svg";
import thermometerred from "../../assets/icons/thermometerred.svg";
import {
  GoogleMap,
  Marker,
  MarkerClustererF,
  useJsApiLoader,
} from "@react-google-maps/api";
interface DeviceWithStats extends Device {
  eventCount: number;
  lastEventTime: string;
  revenue: number;
}

interface MachineDetail {
  id: string;
  name: string;
  serialNumber: string;
  reference: string;
  status: "operational" | "maintenance" | "offline";
  uptime: number;
  temperature: number;
  network: "connected" | "weak" | "disconnected";
  geofence: string;
  revenue24h: number;
  location: string;
  recentEvents: Array<{
    timestamp: string;
    event: string;
    location: string;
  }>;
}
const severityOptions = ["All Severities", "Critical", "High", "Medium", "Low"];
const clustersOptions = ["Group A", "Group B", "Group C", "Group D"];
function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMFA, setShowMFA] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [mfaAction, setMfaAction] = useState<"enable" | "disable" | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [machineDetail, setMachineDetail] = useState<MachineDetail | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"grid" | "map">("grid");
  const [mapSelectedDevice, setMapSelectedDevice] = useState<Device | null>(
    null
  );

  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [devicesRes, eventsRes] = await Promise.all([
          getDevices(),
          getEvents(),
        ]);
        setDevices(devicesRes.devices || []);
        setEvents(eventsRes.events || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleMachineControl = (
    device: Device,
    action: "enable" | "disable"
  ) => {
    setSelectedDevice(device);
    setMfaAction(action);
    setShowMFA(true);
  };

  const handleMFAConfirm = async (otp: string) => {
    if (!selectedDevice || !mfaAction) return;

    try {
      // TODO: Implement actual device command API call
      console.log(
        `MFA confirmed for ${mfaAction} device ${selectedDevice.device_id} with OTP: ${otp}`
      );

      // Update device status locally
      setDevices((prev) =>
        prev.map((d) =>
          d.device_id === selectedDevice.device_id
            ? { ...d, is_online: mfaAction === "enable" }
            : d
        )
      );

      setMachineDetail((prev) =>
        prev
          ? {
              ...prev,
              status: mfaAction === "enable" ? "operational" : "offline",
            }
          : prev
      );
    } catch (error) {
      console.error("Device command failed:", error);
    }
  };

  const openDetail = (id: string, preset: Partial<MachineDetail>) => {
    const device = devices.find((d) => d.device_id === id) || null;
    setSelectedDevice(device);
    const detail: MachineDetail = {
      id,
      name: preset.name || `Gaming Terminal ${id.replace("M-", "")}`,
      serialNumber: preset.serialNumber || "AKTDUM-8079843539",
      reference: preset.reference || "Fireball",
      status: preset.status || "operational",
      uptime: preset.uptime ?? 98.5,
      temperature: preset.temperature ?? 72,
      network: preset.network || "connected",
      geofence: preset.geofence || "Active",
      revenue24h: preset.revenue24h ?? 8500,
      location:
        preset.location || "200 South Front Street Clearfield, PA 16830 US",
      recentEvents: preset.recentEvents || [
        {
          timestamp: "10:09 PM",
          event: "Power Reconnected",
          location: "200 South Front Street, Clearfield, Pennsylvania 16830",
        },
        {
          timestamp: "10:01 PM",
          event: "Connection Lost",
          location: "200 South Front Street, Clearfield, Pennsylvania 16830",
        },
      ],
    };
    setMachineDetail(detail);
    setDetailOpen(true);
  };

  const devicesWithStats: DeviceWithStats[] = useMemo(() => {
    return devices.map((device) => {
      const deviceEvents = events.filter(
        (e) => e.device_id === device.device_id
      );
      const revenue = deviceEvents
        .filter((e) => e.is_financial_event)
        .reduce((sum, e) => sum + (Number(e.parsed_amount) || 0), 0);

      const lastEvent = deviceEvents.sort(
        (a, b) =>
          new Date(b.event_timestamp).getTime() -
          new Date(a.event_timestamp).getTime()
      )[0];

      return {
        ...device,
        eventCount: deviceEvents.length,
        lastEventTime:
          lastEvent?.event_timestamp || device.last_event_time || "",
        revenue,
      };
    });
  }, [devices, events]);

  const filteredDevices = useMemo(() => {
    let filtered = devicesWithStats;

    // Filter by status
    if (filter === "online") {
      filtered = filtered.filter((d) => d.is_online);
    } else if (filter === "offline") {
      filtered = filtered.filter((d) => !d.is_online);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [devicesWithStats, filter, searchTerm]);

  const onlineCount = devices.filter((d) => d.is_online).length;
  const offlineCount = devices.filter((d) => !d.is_online).length;
  const totalRevenue = devicesWithStats.reduce((sum, d) => sum + d.revenue, 0);

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
              Machine Control Center
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center gap-2 bg-[rgba(244,244,245,1)] p-1 rounded-[12px]">
              <button
                onClick={() => setActiveTab("grid")}
                className={`px-5 py-1 text-base font-normal rounded-[12px] transition-colors ${
                  activeTab === "grid"
                    ? "bg-white text-[rgba(17,17,17,1)]"
                    : "bg-transparent text-[rgba(113,113,130,1)] hover:bg-white hover:text-[rgba(17,17,17,1)]"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-5 py-1 text-base font-normal rounded-[12px] transition-colors ${
                  activeTab === "map"
                    ? "bg-white text-[rgba(17,17,17,1)]"
                    : "bg-transparent text-[rgba(113,113,130,1)] hover:bg-white hover:text-[rgba(17,17,17,1)]"
                }`}
              >
                Map
              </button>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md   bg-[rgba(0,163,47,0.04)] border border-[rgba(0,145,64,0.44)] px-[10px] py-[6px] font-medium text-[14px] leading-none text-[rgba(0,113,63,0.87)]">
              2 Online
            </div>
            <div className="inline-flex items-center gap-2 rounded-md  border border-[rgba(223,0,3,0.34)] bg-[rgba(255,0,0,0.03)] px-[10px] py-[6px] font-medium text-[14px] leading-none text-red-700">
              2 Error
            </div>
          </div>
        </div>

        {/* Filters & Search Section */}
        <div className="flex justify-between items-center rounded-lg border border-[rgba(230,230,230,1)] bg-[rgba(254,254,254,1)] p-5">
          <h3 className="text-[18px] font-medium leading-[100%] tracking-[-0.02em] text-gray-900">
            Filters & Search
          </h3>
          <div className="flex items-center space-x-4">
            <CustomSelect
              options={clustersOptions}
              firstOption="All Clusters"
              multiSelect={true}
              onChange={(selected) => console.log("Selected:", selected)}
            />
            <CustomSelect
              options={severityOptions}
              value="All Statuses"
              multiSelect={false}
              onChange={(val) => console.log("Selected:", val)}
            />
          </div>
        </div>

        {/* Tabs */}

        {/* Tab Content */}
        {activeTab === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Online Machine Card */}
            <div className="rounded-[8px] border border-[rgba(185,248,207,1)] gap-6 bg-[rgba(243,255,248,1)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">M-001</h3>
                  <p className="text-[rgba(0,7,20,0.62)] font-normal text-sm ">
                    Gaming Terminal 001
                  </p>
                </div>
                <span className="bg-[rgba(48,164,108,1)] text-white px-[7px] py-[2px] rounded text-xs font-medium">
                  Online
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-7">
                  <div className="flex items-center space-x-2">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Location
                      </span>
                      <p className="font-medium text-[14px]">
                        Floor 1, Section A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>

                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Group
                      </span>
                      <p className="font-medium text-[14px]">Group A</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-[65px]">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Network
                      </span>
                      <p className="font-medium text-[14px]">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={thermometer} alt="" />
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Temperature
                      </span>
                      <p className="font-medium text-[14px]  text-green-500">
                        68°F
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-[rgba(255,255,255,0.14)] border border-[rgba(239,239,239,1)] rounded-[5px] p-3 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Revenue (24h)
                  </p>
                  <p className="text-[14px] font-medium">$8,500</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">Uptime</p>
                  <p className="text-[14px] font-medium">98.5%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Last Seen
                  </p>
                  <p className="text-[14px] font-medium">2 mins ago</p>
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(202,213,226,1)] my-5"></div>
              <div className="mt-4 flex space-x-2">
                <button
                  className="w-[268px] h-[40px] rounded-[8px] gap-3 px-[4px)] font-medium text-[rgba(96,100,108,1)] bg-[rgba(0,0,51,0.06)]"
                  onClick={() =>
                    openDetail("M-001", {
                      name: "Mobile Details - M-001",
                      status: "operational",
                      temperature: 68,
                      network: "connected",
                    })
                  }
                >
                  Details
                </button>
                <button
                  className="w-[84px] h-[40px] rounded-[8px] gap-3 font-medium text-white px-[4px] opacity-100 bg-[rgba(139,141,152,1)]"
                  onClick={() =>
                    handleMachineControl(
                      selectedDevice || {
                        device_id: "M-001",
                        imei: "",
                        serial_number: "",
                        is_online: true,
                      },
                      "enable"
                    )
                  }
                >
                  Enable
                </button>
              </div>
            </div>

            {/* Maintenance Machine Card */}
            <div className="rounded-[8px] bg-[rgba(254,252,232,0.4)] border border-[rgba(254,241,134,1)] gap-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">M-045</h3>
                  <p className="text-[rgba(0,7,20,0.62)] font-normal text-sm ">
                    Gaming Terminal 045
                  </p>
                </div>
                <span className="bg-[rgba(255,197,61,1)] text-[rgba(0,7,20,0.62)] px-[7px] py-[2px] rounded text-xs font-medium">
                  Maintenance
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-7">
                  <div className="flex items-center space-x-2">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Location
                      </span>
                      <p className="font-medium text-[14px]">
                        Floor 1, Section A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>

                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Group
                      </span>
                      <p className="font-medium text-[14px]">Group A</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-[65px]">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-[rgba(209,135,0,1)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Network
                      </span>
                      <p className="font-medium text-[14px]">Week</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={thermometeryellow} alt="" />
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Temperature
                      </span>
                      <p className="font-medium text-[14px] text-[rgba(209,135,0,1)]">
                        68°F
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-[rgba(255,255,255,0.14)] border border-[rgba(239,239,239,1)] rounded-[5px] p-3 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Revenue (24h)
                  </p>
                  <p className="text-[14px] font-medium">$8,500</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">Uptime</p>
                  <p className="text-[14px] font-medium">98.5%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Last Seen
                  </p>
                  <p className="text-[14px] font-medium">2 mins ago</p>
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(202,213,226,1)] my-5"></div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="w-[268px] h-[40px] rounded-[8px] gap-3 px-[4px)] font-medium text-[rgba(96,100,108,1)] bg-[rgba(0,0,51,0.06)]"
                  onClick={() =>
                    openDetail("M-045", {
                      name: "Mobile Details - M-045",
                      status: "maintenance",
                      temperature: 78,
                      network: "weak",
                    })
                  }
                >
                  Details
                </button>
                <button
                  className="w-[84px] h-[40px] rounded-[8px] gap-3 font-medium text-white px-[4px] opacity-100 bg-[rgba(139,141,152,1)]"
                  onClick={() =>
                    handleMachineControl(
                      selectedDevice || {
                        device_id: "M-045",
                        imei: "",
                        serial_number: "",
                        is_online: true,
                      },
                      "enable"
                    )
                  }
                >
                  Enable
                </button>
              </div>
            </div>

            {/* Error Machine Card */}
            <div className="rounded-[8px] bg-[rgba(255,247,247,1)] border border-[rgba(0,0,47,0.15)] gap-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">M-023</h3>
                  <p className="text-[rgba(0,7,20,0.62)] font-normal text-sm ">
                    Gaming Terminal 023
                  </p>
                </div>
                <span className="bg-[rgba(229,72,77,1)] text-white px-[7px] py-[2px] rounded text-xs font-medium">
                  Error
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-7">
                  <div className="flex items-center space-x-2">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Location
                      </span>
                      <p className="font-medium text-[14px]">
                        Floor 1, Section A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>

                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Group
                      </span>
                      <p className="font-medium text-[14px]">Group A</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-[65px]">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-[rgba(229,72,77,1)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Network
                      </span>
                      <p className="font-medium text-[14px]">Disconnected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={thermometerred} alt="" />
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Temperature
                      </span>
                      <p className="font-medium text-[14px] text-[rgba(229,72,77,1)]">
                        68°F
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-[rgba(255,255,255,0.14)] border border-[rgba(239,239,239,1)] rounded-[5px] p-3 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Revenue (24h)
                  </p>
                  <p className="text-[14px] font-medium">$8,500</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">Uptime</p>
                  <p className="text-[14px] font-medium">98.5%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Last Seen
                  </p>
                  <p className="text-[14px] font-medium">2 mins ago</p>
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(202,213,226,1)] my-5"></div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="w-[268px] h-[40px] rounded-[8px] gap-3 px-[4px)] font-medium text-[rgba(96,100,108,1)] bg-[rgba(0,0,51,0.06)]"
                  onClick={() =>
                    openDetail("M-023", {
                      name: "Mobile Details - M-023",
                      status: "offline",
                      temperature: 72,
                      network: "disconnected",
                    })
                  }
                >
                  Details
                </button>
                <button
                  className="w-[84px] h-[40px] rounded-[8px] gap-3 font-medium text-white px-[4px] opacity-100 bg-[rgba(229,72,77,1)]"
                  onClick={() =>
                    handleMachineControl(
                      selectedDevice || {
                        device_id: "M-023",
                        imei: "",
                        serial_number: "",
                        is_online: false,
                      },
                      "disable"
                    )
                  }
                >
                  Disable
                </button>
              </div>
            </div>

            <div className="rounded-[8px] bg-[rgba(249,250,251,1)] border border-[rgba(0,0,47,0.15)] gap-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">M-023</h3>
                  <p className="text-[rgba(0,7,20,0.62)] font-normal text-sm ">
                    Gaming Terminal 023
                  </p>
                </div>
                <span className="bg-[rgba(139,141,152,1)] text-white px-[7px] py-[2px] rounded text-xs font-medium">
                  Offline
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-7">
                  <div className="flex items-center space-x-2">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Location
                      </span>
                      <p className="font-medium text-[14px]">
                        Floor 1, Section A
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>

                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Group
                      </span>
                      <p className="font-medium text-[14px]">Group A</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-[65px]">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-[rgba(229,72,77,1)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Network
                      </span>
                      <p className="font-medium text-[14px]">Disconnected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={thermometerred} alt="" />
                    <div>
                      <span className="text-[14px] text-[rgba(0,7,20,0.62)]">
                        Temperature
                      </span>
                      <p className="font-medium text-[14px] text-[rgba(229,72,77,1)]">
                        68°F
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-[rgba(255,255,255,0.5)] border border-[rgba(239,239,239,1)] rounded-[5px] p-3 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Revenue (24h)
                  </p>
                  <p className="text-[14px] font-medium">$8,500</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">Uptime</p>
                  <p className="text-[14px] font-medium">98.5%</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-[rgba(0,7,20,0.62)]">
                    Last Seen
                  </p>
                  <p className="text-[14px] font-medium">2 mins ago</p>
                </div>
              </div>
              <div className="w-full py-[10px] px-[15px] bg-[rgba(234,28,37,0.03)] mt-5 rounded-[5px]">
                <p className="font-medium text-[rgba(234,28,37,1)]">
                  Geofence violation - Auto-disabled
                </p>
              </div>
              <div className="h-[1px] w-full bg-[rgba(202,213,226,1)] my-5"></div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="w-[268px] h-[40px] rounded-[8px] gap-3 px-[4px)] font-medium text-[rgba(96,100,108,1)] bg-[rgba(0,0,51,0.06)]"
                  onClick={() =>
                    openDetail("M-023", {
                      name: "Mobile Details - M-023",
                      status: "offline",
                      temperature: 72,
                      network: "disconnected",
                    })
                  }
                >
                  Details
                </button>
                <button
                  className="w-[84px] h-[40px] rounded-[8px] gap-3 font-medium text-[rgba(0,8,48,0.27)] px-[4px] opacity-100 bg-[rgba(0,0,51,0.06)]"
                  onClick={() =>
                    handleMachineControl(
                      selectedDevice || {
                        device_id: "M-023",
                        imei: "",
                        serial_number: "",
                        is_online: false,
                      },
                      "enable"
                    )
                  }
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="card p-0 overflow-hidden">
            <div className="relative">
              {(loading || !isMapLoaded) && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              )}

              {isMapLoaded && (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "600px" }}
                  center={{ lat: 0, lng: 0 }}
                  zoom={2}
                  options={{
                    disableDefaultUI: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  <MarkerClustererF>
                    {(clusterer: any) => (
                      <>
                        {devices
                          .filter(
                            (d) =>
                              typeof d.lat === "number" &&
                              typeof d.lon === "number"
                          )
                          .map((d) => (
                            <Marker
                              key={d.device_id}
                              clusterer={clusterer}
                              position={{
                                lat: d.lat as number,
                                lng: d.lon as number,
                              }}
                              icon={
                                d.is_online
                                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                              }
                              onClick={() => setMapSelectedDevice(d)}
                            />
                          ))}
                      </>
                    )}
                  </MarkerClustererF>
                </GoogleMap>
              )}
            </div>
          </div>
        )}

        {mapSelectedDevice && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Device Details
              </h3>
              <button
                onClick={() => setMapSelectedDevice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Device Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Device ID:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.device_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nickname:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.nickname || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IMEI:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.imei}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serial Number:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.serial_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mapSelectedDevice?.is_online
                          ? "status-online"
                          : "status-offline"
                      }`}
                    >
                      {mapSelectedDevice?.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Location & Activity
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latitude:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.lat?.toFixed(6) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Longitude:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.lon?.toFixed(6) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Event:</span>
                    <span className="font-medium">
                      {mapSelectedDevice?.last_event_time
                        ? new Date(
                            mapSelectedDevice.last_event_time || ""
                          ).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MFA Confirmation Modal */}

        <MFAConfirmation
          isOpen={showMFA}
          onClose={() => {
            setShowMFA(false);
            setSelectedDevice(null);
            setMfaAction(null);
          }}
          onConfirm={handleMFAConfirm}
          title={`${mfaAction === "enable" ? "Enable" : "Disable"} Machine`}
          description={`This will ${
            mfaAction === "enable" ? "enable" : "disable"
          } machine ${selectedDevice?.device_id || ""}`}
          action={mfaAction === "enable" ? "Enable Machine" : "Disable Machine"}
        />
      </div>
      <MachineDetailDrawer
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        detail={machineDetail}
        onRestart={() => console.log("Restarting machine", machineDetail?.id)}
        onToggleEnable={() => {
          if (!machineDetail) return;
          const action =
            machineDetail.status === "operational" ? "disable" : "enable";
          setMfaAction(action);
          if (selectedDevice) {
            setShowMFA(true);
          } else {
            setSelectedDevice({
              device_id: machineDetail.id,
              imei: "",
              serial_number: "",
              is_online: machineDetail.status === "operational",
            });
            setShowMFA(true);
          }
        }}
        isEnabled={machineDetail?.status === "operational"}
      />
    </>
  );
}

export default DeviceManagement;
