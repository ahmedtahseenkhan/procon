import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "../Dashboard";
import MapView from "../Map/MapView";
import AlertFeed from "../Alerts/AlertFeed";
import FinancialReports from "../Reports/FinancialReports";
import GeofenceActivity from "../Reports/GeofenceActivity";
import DeviceManagement from "../Devices/DeviceManagement";
import UserManagement from "../Users/UserManagement";
import LandingPagePreferences from "../Settings/LandingPagePreferences";

interface MainLayoutProps {
  userInfo: any;
  onLogout: () => void;
}

export default function MainLayout({ userInfo, onLogout }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar userInfo={userInfo} onLogout={onLogout} isOpen={sidebarOpen} />

        <div
          className={`fixed inset-0 bg-black/30 z-20 md:hidden ${
            sidebarOpen ? "" : "hidden"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/alerts" element={<AlertFeed />} />
                <Route path="/devices" element={<DeviceManagement />} />
                <Route path="/reports" element={<FinancialReports />} />
                <Route
                  path="/reports/geofence-activity"
                  element={<GeofenceActivity />}
                />
                <Route path="/users" element={<UserManagement />} />
                <Route
                  path="/preferences"
                  element={<LandingPagePreferences />}
                />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
