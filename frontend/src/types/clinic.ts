
export type UserRole = 'super_admin' | 'doctor' | 'receptionist' | 'assistant' | 'manager';

export type SpecialtyModule = 
  | 'dentist' 
  | 'cardiologist' 
  | 'pediatrician' 
  | 'gynecologist' 
  | 'psychiatrist' 
  | 'ophthalmologist' 
  | 'orthopedic' 
  | 'veterinary';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_queue' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'refunded';

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  enabled_modules: SpecialtyModule[];
  created_at: string;
  is_active: boolean;
}

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  allergies: string[];
  medical_history: string[];
  emergency_contact?: string;
  created_at: string;
  last_visit?: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  time_slot: string;
  duration_minutes: number;
  status: AppointmentStatus;
  token_number?: number;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  due_date?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  completedToday: number;
  totalPatients: number;
  newPatientsThisMonth: number;
  todayRevenue: number;
  monthlyRevenue: number;
  noShowRate: number;
  repeatPatientRate: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

export interface FollowUpReminder {
  id: string;
  patient_id: string;
  patient_name: string;
  reminder_date: string;
  reminder_type: 'follow_up' | 'annual_checkup' | 'medication' | 'vaccination';
  message: string;
  status: 'pending' | 'sent' | 'acknowledged';
}
