export type Device = {
  device_id: string
  imei: string
  serial_number: string
  nickname?: string
  status?: string
  lat?: number
  lon?: number
  last_event_time?: string
  is_online?: boolean
  group_name?: string
  full_address?: string
}

export type DeviceEvent = {
  event_uuid: string
  device_id: string
  imei: string
  serial_number: string
  event_type: string
  event_id: string
  event_entry?: string
  parsed_amount?: number
  parsed_status?: string
  is_door_event?: boolean
  is_financial_event?: boolean
  is_cash_box_event?: boolean
  event_timestamp: string
  report_timestamp: string
  severity: string
  is_acknowledged?: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  category?: string
}
