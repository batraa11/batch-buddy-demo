// Mock database using localStorage for demo purposes
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
}

export interface BatchInfo {
  id: string;
  batch_type: 'morning' | 'evening' | 'full' | 'private';
  name: string;
  time_slot: string;
  capacity: number;
  price: string;
  icon: string;
}

// Mock batch data
const MOCK_BATCHES: BatchInfo[] = [
  {
    id: "morning",
    batch_type: "morning",
    name: "Morning Batch",
    time_slot: "6:00 AM - 8:00 AM",
    capacity: 30,
    price: "₹3,500/month",
    icon: "🌅"
  },
  {
    id: "evening",
    batch_type: "evening",
    name: "Evening Batch",
    time_slot: "6:00 PM - 8:00 PM",
    capacity: 30,
    price: "₹3,500/month",
    icon: "🌆"
  },
  {
    id: "full",
    batch_type: "full",
    name: "Full Day Batch",
    time_slot: "9:00 AM - 3:00 PM",
    capacity: 20,
    price: "₹6,000/month",
    icon: "📚"
  },
  {
    id: "private",
    batch_type: "private",
    name: "Private Tutoring",
    time_slot: "Flexible Timing",
    capacity: 5,
    price: "₹10,000/month",
    icon: "👨‍🏫"
  }
];

// Helper functions for localStorage
const getStudents = (): Student[] => {
  const students = localStorage.getItem('demo_students');
  return students ? JSON.parse(students) : [];
};

const saveStudents = (students: Student[]) => {
  localStorage.setItem('demo_students', JSON.stringify(students));
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const students = getStudents();
  return students.some(student => student.email === email);
};

export const registerStudent = async (student: Student): Promise<void> => {
  const students = getStudents();
  students.push({
    ...student,
    id: `STUDENT_${Date.now()}`,
    payment_status: 'completed'
  });
  saveStudents(students);
};

export const getBatchInfo = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_BATCHES;
};

export const getBatchEnrollmentCount = async (batchType: string) => {
  const students = getStudents();
  return students.filter(student => student.batch_type === batchType).length;
};

export const getAllStudents = async () => {
  return getStudents();
};
