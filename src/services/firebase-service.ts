/**
 * Firebase Service Module
 * Handles all Firebase-related operations for EDU Batch Buddy
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student, BatchInfo } from '@/types';

// Collection references
const STUDENTS = 'students';
const BATCHES = 'batches';
const ATTENDANCE = 'attendance';

/**
 * Student Registration
 * Creates a new student record in Firestore
 */
export const registerStudent = async (student: Student): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, STUDENTS), {
      ...student,
      createdAt: serverTimestamp(),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering student:', error);
    throw new Error('Failed to register student');
  }
};

/**
 * Email Verification
 * Checks if an email is already registered in the system
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const q = query(collection(db, STUDENTS), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    throw new Error('Failed to check email');
  }
};

/**
 * Batch Information
 * Retrieves information about all available batches
 */
export const getBatchInfo = async (): Promise<BatchInfo[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, BATCHES));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BatchInfo[];
  } catch (error) {
    console.error('Error fetching batch info:', error);
    throw new Error('Failed to fetch batch info');
  }
};

/**
 * Enrollment Counter
 * Returns the current number of students enrolled in a specific batch
 */
export const getBatchEnrollmentCount = async (batchType: string): Promise<number> => {
  try {
    const q = query(collection(db, STUDENTS), where("batch_type", "==", batchType));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting enrollment count:', error);
    throw new Error('Failed to get enrollment count');
  }
};

/**
 * Attendance Management
 * Records student attendance for a specific date
 */
export const markAttendance = async (
  studentId: string, 
  date: string, 
  status: 'present' | 'absent'
): Promise<void> => {
  try {
    await addDoc(collection(db, ATTENDANCE), {
      studentId,
      date,
      status,
      markedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw new Error('Failed to mark attendance');
  }
};

/**
 * Attendance History
 * Retrieves attendance records for a student within a date range
 */
export const getStudentAttendance = async (
  studentId: string, 
  startDate: string, 
  endDate: string
): Promise<DocumentData[]> => {
  try {
    const q = query(
      collection(db, ATTENDANCE),
      where("studentId", "==", studentId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw new Error('Failed to fetch attendance');
  }
};

/**
 * Progress Tracking
 * Updates student progress records with assessment results
 */
export const updateStudentProgress = async (
  studentId: string,
  progressData: {
    subject: string;
    topic: string;
    score: number;
    feedback: string;
  }
): Promise<void> => {
  try {
    const progressRef = collection(db, 'progress');
    await addDoc(progressRef, {
      studentId,
      ...progressData,
      recordedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    throw new Error('Failed to update progress');
  }
};

/**
 * Batch Transfer
 * Moves a student from one batch to another
 */
export const transferStudent = async (
  studentId: string,
  fromBatch: string,
  toBatch: string
): Promise<void> => {
  try {
    const studentRef = doc(db, STUDENTS, studentId);
    await updateDoc(studentRef, {
      batch_type: toBatch,
      lastTransferDate: serverTimestamp()
    });
  } catch (error) {
    console.error('Error transferring student:', error);
    throw new Error('Failed to transfer student');
  }
}; 