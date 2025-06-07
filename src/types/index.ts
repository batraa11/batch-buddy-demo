export interface Student {
  id?: string;
  name: string;
  email: string;
  phone: string;
  batch_type: 'morning' | 'evening' | 'full' | 'private';
  payment_method: string;
  payment_status?: string;
  registration_date: string;
  referral_source?: string;
  createdAt?: any; // Firebase Timestamp
  status?: 'active' | 'inactive';
}

export interface BatchInfo {
  id: string;
  batch_type: 'morning' | 'evening' | 'full' | 'private';
  name: string;
  time_slot: string;
  capacity: number;
  price: string;
  icon: string;
  description?: string;
  teacher?: string;
}

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  markedAt?: any; // Firebase Timestamp
  markedBy?: string;
}

export interface ProgressRecord {
  id?: string;
  studentId: string;
  subject: string;
  topic: string;
  score: number;
  feedback: string;
  recordedAt?: any; // Firebase Timestamp
  recordedBy?: string;
}

export interface PaymentRequest {
  amount: string;
  currency: string;
  description: string;
  email: string;
  method: 'upi' | 'card';
}

export interface PaymentResponse {
  success: boolean;
  error?: string;
  transactionId?: string;
  orderId?: string;
} 