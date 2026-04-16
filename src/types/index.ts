export type BookingStatus =
  | 'Inquiry'
  | 'Hold'
  | 'Requested'
  | 'Assigned'
  | 'Booked'
  | 'Completed'
  | 'Cancelled'

export type ConflictType =
  | 'Hard Conflict'
  | 'Possible Conflict'
  | 'Missing Info Warning'
  | null

export type Page = 'dashboard' | 'calendar' | 'ingest' | 'availability' | 'schedule'

export type ViewMode = 'owner' | 'shared'

export type IngestionSource = 'screenshot' | 'text' | 'email' | 'invoice' | 'manual'

export interface DJ {
  id: string
  name: string
  available: boolean
  city: string
  state: string
}

export interface Venue {
  id: string
  name: string
  city: string
  state: string
  operatorId: string
}

export interface Operator {
  id: string
  name: string
  venueIds: string[]
}

export interface RecurringShift {
  id: string
  venueId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  crossMidnight: boolean
  afterHours: boolean
  assignedDJId: string | null
}

export interface Booking {
  id: string
  djId: string
  venueId: string | null
  title: string
  nightlifeDate: string
  startTime: string
  endTime: string
  crossMidnight: boolean
  afterHours: boolean
  status: BookingStatus
  conflict: ConflictType
  city: string
  state: string
  fee: number | null
  notes: string | null
  source: IngestionSource
  followUpMessages: string[]
}

export interface ExtractionResult {
  id: string
  rawInput: string
  extractedTitle: string
  extractedDate: string
  extractedTime: string
  extractedVenue: string
  extractedFee: string | null
  confidence: 'high' | 'medium' | 'low'
}
