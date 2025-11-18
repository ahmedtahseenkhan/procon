import { useEffect, useState } from 'react'
import { getDevices, getEvents } from '../../services/api'
import { Device, DeviceEvent } from '../../types'
import TopNavigationIcon  from '../../assets/icons/topnavigation.svg'
import bell  from '../../assets/icons/bell.svg'
import UserDropdown from './UserDropdown'
import NotificationPopover from './NotificationPopover'
interface GlobalStats {
  activeMachines: number
  totalRevenue: number
  uptime: number
  revenueChange: number
  machineChange: number
  activeAlerts: number
  livePlayers: number
}

interface HeaderProps {
  onToggleSidebar?: () => void
}

function Header({ onToggleSidebar }: HeaderProps) {
  const [stats, setStats] = useState<GlobalStats>({
    activeMachines: 0,
    totalRevenue: 0,
    uptime: 0,
    revenueChange: 0,
    machineChange: 0,
    activeAlerts: 0,
    livePlayers: 0
  })
  const [notifications, setNotifications] = useState(3)
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [devicesRes, eventsRes] = await Promise.all([
          getDevices(),
          getEvents()
        ])
        
        const devices: Device[] = devicesRes.devices || []
        const events: DeviceEvent[] = eventsRes.events || []
        
        const activeMachines = devices.filter((d: Device) => d.is_online).length
        const totalRevenue = events
          .filter((e: DeviceEvent) => e.is_financial_event)
          .reduce((sum: number, e: DeviceEvent) => sum + (Number(e.parsed_amount) || 0), 0)
        const activeAlerts = events.filter((e: DeviceEvent) => e.severity === 'critical' || e.severity === 'high').length
        setNotifications(activeAlerts)
        const livePlayers = Math.max(0, activeMachines * 10)
        
        setStats({
          activeMachines,
          totalRevenue,
          uptime: 99.2, // This would be calculated from actual uptime data
          revenueChange: 12.5, // This would be calculated from historical data
          machineChange: 3, // This would be calculated from historical data
          activeAlerts,
          livePlayers
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left - Toggle */}
       <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {/* <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg> */}
            <img src={TopNavigationIcon} alt="Menu" className="w-6 h-6" />
        </button>
      </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right - Bell, Stat Pills, Avatar */}
        <div className="flex items-center space-x-4">
          <div className="relative mr-4">
            <button 
              onClick={() => setIsNotificationPopoverOpen(!isNotificationPopoverOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 relative flex items-center justify-center"
            >
              <img src={bell} alt="Notifications" className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-2  bg-[rgba(179,38,30,1)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <NotificationPopover
              isOpen={isNotificationPopoverOpen}
              onClose={() => setIsNotificationPopoverOpen(false)}
              notificationCount={notifications}
            />
          </div>

          {/* Stat pills (md+) */}
          {/* <div className="hidden md:flex items-center space-x-3">
            <div className="border border-gray-200 rounded-xl px-4 py-2 bg-white">
              <div className="text-xs text-gray-500">Active Machines</div>
              <div className="flex items-baseline space-x-2">
                <div className="text-sm font-semibold text-gray-900">{stats.activeMachines}</div>
                <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">+{stats.machineChange}</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl px-4 py-2 bg-white">
              <div className="text-xs text-gray-500">Total Revenue</div>
              <div className="flex items-baseline space-x-2">
                <div className="text-sm font-semibold text-gray-900">${(stats.totalRevenue / 1000).toFixed(1)}k</div>
                <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">+{stats.revenueChange}%</span>
              </div>
            </div>
          </div> */}
          <div className="hidden md:flex items-center  rounded-lg px-4 py-1.5 gap-6
                bg-[rgba(248,250,251,1)] border border-[rgba(226,232,241,1)]">
            {/* Active Machines */}
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-[16px] font-normal tracking-[-0.02em] text-gray-500">
                Active Machines
              </div>
              <div className="flex items-baseline space-x-2">
               <div className="text-[16px] font-bold  text-gray-900 text-center">
                  {stats.activeMachines}
                </div>
                {/* <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  +{stats.machineChange}
                </span> */}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-9 bg-gray-200" />

            {/* Total Revenue */}
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-[16px] font-normal tracking-[-0.02em] text-gray-500">
                Total Revenue
              </div>
              <div className="flex items-baseline space-x-2">
              <div className="text-[16px] font-bold  text-[rgba(0,128,0,1)]">
                ${(stats.totalRevenue / 1000).toFixed(1)}k
              </div>
                {/* <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  +{stats.revenueChange}%
                </span> */}
              </div>
            </div>
          </div>


          <UserDropdown />
        </div>
      </div>
    </header>
  )
}

export default Header
