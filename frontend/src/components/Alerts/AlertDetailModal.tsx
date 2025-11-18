import { useState } from 'react'
import { DeviceEvent } from '../../types'

interface AlertDetailModalProps {
  alert: DeviceEvent | null
  isOpen: boolean
  onClose: () => void
  onAcknowledge: (eventId: string) => void
  onResolve: (eventId: string) => void
}

function AlertDetailModal({ alert, isOpen, onClose, onAcknowledge, onResolve }: AlertDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !alert) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'Main Door Open':
      case 'Upper Door Open':
      case 'Belly Door Open':
      case 'Cash Door Open':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      case 'Cash Box Removed':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'Voucher Over Threshold':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'Vibration/Tamper Alert':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'Power Disconnect':
        return (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'Clear/Print Receipt':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const handleAcknowledge = async () => {
    setIsLoading(true)
    try {
      await onAcknowledge(alert.event_id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async () => {
    setIsLoading(true)
    try {
      await onResolve(alert.event_id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getEventTypeIcon(alert.event_id)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{alert.event_id}</h3>
              <p className="text-sm text-gray-500">Device: {alert.device_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                alert.is_acknowledged ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {alert.is_acknowledged ? 'Acknowledged' : 'Pending'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(alert.event_timestamp).toLocaleString()}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Event Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Event Type:</span>
                  <span className="font-medium">{alert.event_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Event ID:</span>
                  <span className="font-medium">{alert.event_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Device ID:</span>
                  <span className="font-medium">{alert.device_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IMEI:</span>
                  <span className="font-medium">{alert.imei}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Serial Number:</span>
                  <span className="font-medium">{alert.serial_number}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">
                    {alert.parsed_amount ? `$${alert.parsed_amount}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Financial Event:</span>
                  <span className="font-medium">
                    {alert.is_financial_event ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Door Event:</span>
                  <span className="font-medium">
                    {alert.is_door_event ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cash Box Event:</span>
                  <span className="font-medium">
                    {alert.is_cash_box_event ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Entry */}
          {alert.event_entry && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Event Details</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{alert.event_entry}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAcknowledge}
                disabled={isLoading || alert.is_acknowledged}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  alert.is_acknowledged
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Processing...' : 'Acknowledge'}
              </button>
              <button
                onClick={handleResolve}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Resolve'}
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertDetailModal
