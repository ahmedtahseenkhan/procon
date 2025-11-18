class EventProcessor {
  processEvent(rawEvent) {
    const amount = this.extractAmount(rawEvent.entry);
    const status = this.normalizeStatus(rawEvent.entry);
    const isDoor = this.isDoorEvent(rawEvent);
    const isCashBox = this.isCashBoxEvent(rawEvent);
    const isFinancial = this.isFinancialEvent(rawEvent);
    const eventTsRaw = rawEvent.eventtimestamp;
    const eventTs = (typeof eventTsRaw === 'string' && !/[zZ]|[+\-]\d{2}:?\d{2}/.test(eventTsRaw))
      ? new Date(String(eventTsRaw).replace(' ', 'T') + 'Z')
      : new Date(eventTsRaw);
    return {
      row_id: parseInt(rawEvent.row_id, 10),
      device_id: rawEvent.serial, // using serial as device_id key
      imei: rawEvent.imei,
      serial_number: rawEvent.serial,
      event_type: rawEvent.eventtype,
      event_id: rawEvent.eventid,
      event_entry: rawEvent.entry,
      parsed_amount: amount,
      parsed_status: status,
      is_door_event: isDoor,
      is_cash_box_event: isCashBox,
      is_financial_event: isFinancial,
      event_timestamp: eventTs,
      report_timestamp: new Date(rawEvent.reporttime),
      severity: this.determineSeverity(rawEvent)
    };
  }
  extractAmount(entry) {
    if (typeof entry === 'string' && entry.includes('$')) {
      const cleaned = entry.replace(/\$/g, '').replace(/,/g, '');
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }
  normalizeStatus(entry) {
    if (!entry) return null;
    return String(entry)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
  isDoorEvent(ev) {
    const e = (ev.entry || '').toLowerCase();
    return e.includes('door open') || e.includes('door closed') || e.includes('main door') || e.includes('upper door') || e.includes('belly door') || e.includes('cash door');
  }
  isCashBoxEvent(ev) {
    const e = (ev.entry || '').toLowerCase();
    return e.includes('cash box removed') || e.includes('cash box inserted');
  }
  isFinancialEvent(ev) {
    return ev.eventid === 'Money Added' || (typeof ev.entry === 'string' && ev.entry.includes('$'));
  }
  determineSeverity(ev) {
    // derive from catalog-friendly values; fallback rules
    if (ev.eventid === 'Money Added') return 'normal';
    const entry = (ev.entry || '').toLowerCase();
    if (entry.includes('door open') || entry.includes('cash box removed')) return 'critical';
    return 'info';
  }
}

module.exports = new EventProcessor();
