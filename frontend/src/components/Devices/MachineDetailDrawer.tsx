import React from 'react'

interface MachineDetail {
  id: string
  name: string
  serialNumber: string
  reference: string
  status: 'operational' | 'maintenance' | 'offline'
  uptime: number
  temperature: number
  network: 'connected' | 'weak' | 'disconnected'
  geofence: string
  revenue24h: number
  location: string
  recentEvents: Array<{
    timestamp: string
    event: string
    location: string
  }>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  detail: MachineDetail | null
  onRestart: () => void
  onToggleEnable: () => void
  isEnabled: boolean
}

export default function MachineDetailDrawer({ isOpen, onClose, detail, onRestart, onToggleEnable, isEnabled }: Props) {
  if (!isOpen || !detail) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-screen w-[464px] bg-white z-50 shadow-[-8px_8px_24px_-8px_rgba(0,0,0,0.16),0px_0px_1px_rgba(0,0,0,0.4)] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full relative">
          {/* Header Section */}
          <div className="relative">
            {/* Title */}
            <div className="absolute left-6 top-7">
              <h2 className="font-['DM_Sans'] font-medium text-base leading-6 text-black">
                Machine Details – {detail.id}
              </h2>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute right-6 top-4 w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-50 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Divider Line */}
            <div className="absolute left-0 top-[79px] w-full h-0 border-t border-[#E2E2E2]" />
            
            {/* Title Description */}
            <div className="absolute left-6 top-[95px] w-[422px]">
              <p className="font-['DM_Sans'] font-normal text-base leading-5 text-[#595D62]">
                Detailed information and controls for {detail.name}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="absolute left-6 top-[163px] w-[422px] flex flex-col gap-4 overflow-y-auto pb-4" style={{ height: 'calc(100vh - 163px - 100px)' }}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-['DM_Sans'] text-base text-black mb-3">Device Information</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{detail.reference}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Device Serial Number</span><span className="font-medium text-gray-900">{detail.serialNumber}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Reference</span><span className="font-medium text-gray-900">{detail.reference}</span></div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-['DM_Sans'] text-base text-black mb-3">Status Information</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded text-xs font-medium ${detail.status === 'operational' ? 'bg-green-100 text-green-700' : detail.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{detail.status === 'operational' ? 'Operational' : detail.status === 'maintenance' ? 'Maintenance' : detail.status === 'offline' ? 'ERROR' : 'Offline'}</span></div>
                <div>
                  <div className="flex items-center justify-between"><span className="text-gray-500">Uptime</span><span className="font-medium text-gray-900">{detail.uptime}%</span></div>
                  <div className="w-full h-2 bg-gray-200 rounded mt-1"><div className="h-2 bg-green-500 rounded" style={{ width: `${detail.uptime}%` }} /></div>
                </div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Temperature</span><span className="font-medium text-gray-900">{detail.temperature}°F</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Network</span><span className={`font-medium ${detail.network === 'connected' ? 'text-green-600' : detail.network === 'weak' ? 'text-yellow-600' : 'text-red-600'}`}>{detail.network}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Geofence</span><span className="font-medium text-gray-900">{detail.geofence}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Revenue (24h)</span><span className="font-medium text-gray-900">${detail.revenue24h.toLocaleString()}</span></div>
                <div className="flex items-start justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-900 text-right max-w-[220px]">{detail.location}</span></div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-['DM_Sans'] text-base text-black mb-3">Events</div>
              <div className="mb-3">
                <input type="date" defaultValue={detail.recentEvents[0]?.timestamp?.slice(0,10) || '2025-08-25'} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="space-y-2">
                {detail.recentEvents.map((ev, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500">{ev.location}</div>
                    <div className="text-sm font-semibold text-gray-900">{ev.timestamp} {ev.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200 flex items-center justify-end space-x-3 bg-white">
            <button onClick={onRestart} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm">Restart Machine</button>
            <button onClick={onToggleEnable} className={`px-4 py-2 rounded-lg text-sm ${isEnabled ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{isEnabled ? 'Disable' : 'Enable'}</button>
          </div>
        </div>
      </div>
    </>
  )
}
