import { useEffect, useMemo, useState } from 'react'
import { GoogleMap, Marker, MarkerClustererF, useJsApiLoader } from '@react-google-maps/api'
import { getDevices } from '../../services/api'
import { Device } from '../../types'

function MapView() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(true)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  })

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true)
        const response = await getDevices()
        const devicesData = response.devices || []
        setDevices(devicesData)
      } catch (error) {
        console.error('Error fetching devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
    const interval = setInterval(fetchDevices, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const onlineDevices = devices.filter(d => d.is_online).length
  const offlineDevices = devices.filter(d => !d.is_online).length

  const center = useMemo(() => ({ lat: 0, lng: 0 }), [])
  const containerStyle = useMemo(() => ({ width: '100%', height: '24rem' }), [])

  const markerIcon = (isOnline: boolean) => (
    isOnline
      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Map</h1>
          <p className="text-gray-600 mt-1">Real-time device locations and status</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{onlineDevices} Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{offlineDevices} Offline</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-semibold text-gray-900">{devices.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-semibold text-gray-900">{onlineDevices}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-semibold text-gray-900">{offlineDevices}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="relative">
          {(loading || !isLoaded) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={2}
              options={{
                disableDefaultUI: false,
                streetViewControl: false,
                mapTypeControl: false
              }}
            >
              <MarkerClustererF>
                {(clusterer: any) => (
                  <>
                    {devices
                      .filter(d => typeof d.lat === 'number' && typeof d.lon === 'number')
                      .map((d) => (
                        <Marker
                          key={d.device_id}
                          clusterer={clusterer}
                          position={{ lat: d.lat as number, lng: d.lon as number }}
                          icon={markerIcon(!!d.is_online)}
                          onClick={() => setSelectedDevice(d)}
                        />
                      ))}
                  </>
                )}
              </MarkerClustererF>
            </GoogleMap>
          )}
        </div>
      </div>

      {selectedDevice && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Device Details</h3>
            <button
              onClick={() => setSelectedDevice(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Device Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Device ID:</span>
                  <span className="font-medium">{selectedDevice.device_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nickname:</span>
                  <span className="font-medium">{selectedDevice.nickname || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IMEI:</span>
                  <span className="font-medium">{selectedDevice.imei}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Serial Number:</span>
                  <span className="font-medium">{selectedDevice.serial_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedDevice.is_online ? 'status-online' : 'status-offline'}`}>
                    {selectedDevice.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location & Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-medium">{selectedDevice.lat?.toFixed(6) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-medium">{selectedDevice.lon?.toFixed(6) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Event:</span>
                  <span className="font-medium">
                    {selectedDevice.last_event_time ? new Date(selectedDevice.last_event_time).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapView
