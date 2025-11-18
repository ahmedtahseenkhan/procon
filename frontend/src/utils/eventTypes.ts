export interface EventTypeConfig {
  id: string
  name: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'security' | 'financial' | 'operational' | 'maintenance'
  description: string
  icon: string
  color: string
  requiresAcknowledgment: boolean
  autoResolve: boolean
  autoResolveTime?: number // in minutes
}

export const EVENT_TYPES: Record<string, EventTypeConfig> = {
  'main_door_open': {
    id: 'main_door_open',
    name: 'Main Door Open',
    severity: 'critical',
    category: 'security',
    description: 'Physical sensor triggered - access to logic box and main power supply',
    icon: 'door',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'upper_door_open': {
    id: 'upper_door_open',
    name: 'Upper Door Open',
    severity: 'critical',
    category: 'security',
    description: 'Physical sensor triggered - typically includes displays',
    icon: 'door',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'belly_door_open': {
    id: 'belly_door_open',
    name: 'Belly Door Open',
    severity: 'critical',
    category: 'security',
    description: 'Physical sensor triggered - access to cash box area',
    icon: 'door',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'cash_door_open': {
    id: 'cash_door_open',
    name: 'Cash Door Open',
    severity: 'critical',
    category: 'security',
    description: 'Physical sensor triggered - access to inner compartment with cash box',
    icon: 'door',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'cash_box_removed': {
    id: 'cash_box_removed',
    name: 'Cash Box Removed',
    severity: 'critical',
    category: 'security',
    description: 'Physical sensor triggered - cash box physically removed',
    icon: 'box',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'voucher_over_threshold': {
    id: 'voucher_over_threshold',
    name: 'Voucher Over Threshold',
    severity: 'high',
    category: 'financial',
    description: 'Large payout detected - potential fraud indicator',
    icon: 'money',
    color: 'yellow',
    requiresAcknowledgment: true,
    autoResolve: true,
    autoResolveTime: 60
  },
  'vibration_tamper_alert': {
    id: 'vibration_tamper_alert',
    name: 'Vibration/Tamper Alert',
    severity: 'critical',
    category: 'security',
    description: 'Accelerometer detected unauthorized cabinet movement',
    icon: 'warning',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'clear_print_receipt': {
    id: 'clear_print_receipt',
    name: 'Clear/Print Receipt',
    severity: 'low',
    category: 'operational',
    description: 'Manual user operation - accounting period boundary',
    icon: 'receipt',
    color: 'blue',
    requiresAcknowledgment: false,
    autoResolve: true,
    autoResolveTime: 5
  },
  'power_disconnect': {
    id: 'power_disconnect',
    name: 'Power Disconnect',
    severity: 'high',
    category: 'operational',
    description: 'Power loss detected to ProCon device',
    icon: 'power',
    color: 'orange',
    requiresAcknowledgment: true,
    autoResolve: true,
    autoResolveTime: 30
  },
  'geofence_violation': {
    id: 'geofence_violation',
    name: 'Geofence Violation',
    severity: 'critical',
    category: 'security',
    description: 'Machine moved outside designated area',
    icon: 'location',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'logic_door_open': {
    id: 'logic_door_open',
    name: 'Logic Door Open',
    severity: 'critical',
    category: 'security',
    description: 'Physical sensor triggered - security varies by jurisdiction',
    icon: 'door',
    color: 'red',
    requiresAcknowledgment: true,
    autoResolve: false
  },
  'audit_menu_accessed': {
    id: 'audit_menu_accessed',
    name: 'Audit Menu Accessed',
    severity: 'medium',
    category: 'operational',
    description: 'Access to gaming variables and settings',
    icon: 'settings',
    color: 'blue',
    requiresAcknowledgment: false,
    autoResolve: true,
    autoResolveTime: 10
  }
}

export const getEventTypeConfig = (eventId: string): EventTypeConfig => {
  return EVENT_TYPES[eventId] || {
    id: eventId,
    name: eventId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    severity: 'medium',
    category: 'operational',
    description: 'Unknown event type',
    icon: 'info',
    color: 'gray',
    requiresAcknowledgment: false,
    autoResolve: true,
    autoResolveTime: 30
  }
}

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'security': return 'bg-red-50 border-red-200'
    case 'financial': return 'bg-green-50 border-green-200'
    case 'operational': return 'bg-blue-50 border-blue-200'
    case 'maintenance': return 'bg-purple-50 border-purple-200'
    default: return 'bg-gray-50 border-gray-200'
  }
}

export const getEventIcon = (icon: string) => {
  const iconMap: Record<string, JSX.Element> = {
    door: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    box: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    money: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    receipt: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    power: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    location: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  
  return iconMap[icon] || iconMap.info
}
