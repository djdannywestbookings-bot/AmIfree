import type { DJ, Venue, Operator, Booking, RecurringShift, ExtractionResult } from '../types'

export const CURRENT_DJ_ID = 'dj1'

export const MOCK_DJS: DJ[] = [
  { id: 'dj1', name: 'DJ Westside', available: true,  city: 'Chicago',      state: 'IL' },
  { id: 'dj2', name: 'DJ Neon',     available: true,  city: 'Chicago',      state: 'IL' },
  { id: 'dj3', name: 'DJ Static',   available: false, city: 'Milwaukee',    state: 'WI' },
  { id: 'dj4', name: 'DJ Pulse',    available: true,  city: 'Chicago',      state: 'IL' },
  { id: 'dj5', name: 'DJ Axiom',    available: false, city: 'Indianapolis', state: 'IN' },
]

export const MOCK_VENUES: Venue[] = [
  { id: 'v1', name: 'The Vault',        city: 'Chicago', state: 'IL', operatorId: 'op1' },
  { id: 'v2', name: 'Club Meridian',    city: 'Chicago', state: 'IL', operatorId: 'op1' },
  { id: 'v3', name: 'Harbor Rooftop',   city: 'Chicago', state: 'IL', operatorId: 'op2' },
]

export const MOCK_OPERATORS: Operator[] = [
  { id: 'op1', name: 'Prime Nightlife Group', venueIds: ['v1', 'v2'] },
  { id: 'op2', name: 'Lakefront Events',      venueIds: ['v3'] },
]

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1', djId: 'dj1', venueId: 'v1', title: 'Friday Night Residency',
    nightlifeDate: '2026-04-17', startTime: '22:00', endTime: '02:00',
    crossMidnight: true, afterHours: false, status: 'Booked', conflict: null,
    city: 'Chicago', state: 'IL', fee: 800, notes: null, source: 'text',
    followUpMessages: [
      'Hi [Promoter] — confirming Friday at The Vault, 10 PM–2 AM. Can you confirm load-in is 9:30 PM?',
      'Quick follow-up: please send the sound check schedule for Friday.',
    ],
  },
  {
    id: 'b2', djId: 'dj1', venueId: 'v2', title: 'Club Meridian Late Night',
    nightlifeDate: '2026-04-17', startTime: '23:00', endTime: '03:00',
    crossMidnight: true, afterHours: false, status: 'Hold', conflict: 'Hard Conflict',
    city: 'Chicago', state: 'IL', fee: 600,
    notes: 'Overlaps with b1 — same nightlife day, overlapping hours', source: 'email',
    followUpMessages: ['I have an overlap on Friday. Can we move this to the following week?'],
  },
  {
    id: 'b3', djId: 'dj2', venueId: 'v3', title: 'Harbor Rooftop Opener',
    nightlifeDate: '2026-04-18', startTime: '20:00', endTime: '00:00',
    crossMidnight: false, afterHours: false, status: 'Requested', conflict: 'Missing Info Warning',
    city: 'Chicago', state: 'IL', fee: null, notes: 'Fee not confirmed', source: 'screenshot',
    followUpMessages: ['Hey — can you confirm the rate for the Harbor Rooftop opener on Saturday?'],
  },
  {
    id: 'b4', djId: 'dj4', venueId: 'v1', title: 'Saturday After-Hours Set',
    nightlifeDate: '2026-04-18', startTime: '02:00', endTime: '05:00',
    crossMidnight: false, afterHours: true, status: 'Assigned', conflict: null,
    city: 'Chicago', state: 'IL', fee: 400,
    notes: 'Service-day rule: 2–5 AM belongs to Saturday extended nightlife day', source: 'manual',
    followUpMessages: ['Confirming after-hours at The Vault Sat 2–5 AM. Load out by 5:30 AM.'],
  },
  {
    id: 'b5', djId: 'dj2', venueId: null, title: 'Private Corporate Event',
    nightlifeDate: '2026-04-22', startTime: '18:00', endTime: '21:00',
    crossMidnight: false, afterHours: false, status: 'Inquiry', conflict: 'Possible Conflict',
    city: 'Evanston', state: 'IL', fee: 1200,
    notes: 'Possible overlap — verify no other Wed commitments', source: 'email',
    followUpMessages: ["Thanks for reaching out. I'm showing a possible overlap on Apr 22 — can you confirm end time is strictly 9 PM?"],
  },
  {
    id: 'b6', djId: 'dj1', venueId: 'v1', title: 'Friday Residency — Week 2',
    nightlifeDate: '2026-04-24', startTime: '22:00', endTime: '02:00',
    crossMidnight: true, afterHours: false, status: 'Booked', conflict: null,
    city: 'Chicago', state: 'IL', fee: 800, notes: null, source: 'manual', followUpMessages: [],
  },
  {
    id: 'b7', djId: 'dj3', venueId: 'v2', title: 'Club Meridian Guest Spot',
    nightlifeDate: '2026-04-11', startTime: '21:00', endTime: '01:00',
    crossMidnight: true, afterHours: false, status: 'Completed', conflict: null,
    city: 'Chicago', state: 'IL', fee: 500, notes: null, source: 'text', followUpMessages: [],
  },
  {
    id: 'b8', djId: 'dj1', venueId: null, title: 'Festival Side Stage',
    nightlifeDate: '2026-04-14', startTime: '15:00', endTime: '17:00',
    crossMidnight: false, afterHours: false, status: 'Cancelled', conflict: null,
    city: 'Chicago', state: 'IL', fee: 0, notes: 'Cancelled by promoter', source: 'text',
    followUpMessages: ['Received cancellation notice. Please confirm in writing and clarify the kill fee.'],
  },
]

export const MOCK_RECURRING_SHIFTS: RecurringShift[] = [
  { id: 'rs1', venueId: 'v1', dayOfWeek: 5, startTime: '22:00', endTime: '02:00', crossMidnight: true,  afterHours: false, assignedDJId: 'dj1' },
  { id: 'rs2', venueId: 'v1', dayOfWeek: 6, startTime: '22:00', endTime: '02:00', crossMidnight: true,  afterHours: false, assignedDJId: 'dj2' },
  { id: 'rs3', venueId: 'v1', dayOfWeek: 6, startTime: '02:00', endTime: '05:00', crossMidnight: false, afterHours: true,  assignedDJId: 'dj4' },
  { id: 'rs4', venueId: 'v2', dayOfWeek: 5, startTime: '21:00', endTime: '01:00', crossMidnight: true,  afterHours: false, assignedDJId: null  },
  { id: 'rs5', venueId: 'v3', dayOfWeek: 6, startTime: '20:00', endTime: '00:00', crossMidnight: false, afterHours: false, assignedDJId: 'dj2' },
]

export const MOCK_EXTRACTIONS: ExtractionResult[] = [
  {
    id: 'ex1', rawInput: 'Hey are you free Sat May 2? Rooftop at North Ave Beach, 9pm-1am, $750',
    extractedTitle: 'North Ave Beach Rooftop', extractedDate: '2026-05-02',
    extractedTime: '21:00 – 01:00', extractedVenue: 'North Ave Beach Rooftop',
    extractedFee: '$750', confidence: 'high',
  },
  {
    id: 'ex2', rawInput: 'Invoice #2094 — DJ Services, Club Meridian, April 30. 4hr set. $1,200.00',
    extractedTitle: 'Club Meridian DJ Set', extractedDate: '2026-04-30',
    extractedTime: '4-hour set (start time TBD)', extractedVenue: 'Club Meridian',
    extractedFee: '$1,200', confidence: 'medium',
  },
]
