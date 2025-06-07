# Integration Guide: From Demo to Production

This guide explains how to transition this demo project into a production-ready application using Firebase, as implemented in the actual tutoring center deployment.

## Demo vs Production Setup

### Database Integration

**Demo (Current - LocalStorage):**
```typescript
// src/services/database.ts
const getStudents = (): Student[] => {
  const students = localStorage.getItem('demo_students');
  return students ? JSON.parse(students) : [];
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
```

**Production (Firebase):**
```typescript
// src/services/database.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  // ...other config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const registerStudent = async (student: Student): Promise<void> => {
  await addDoc(collection(db, 'students'), {
    ...student,
    createdAt: serverTimestamp(),
    status: 'active'
  });
};

export const getBatchInfo = async () => {
  const batchesRef = collection(db, 'batches');
  const snapshot = await getDocs(batchesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Authentication

**Demo:**
- No authentication implemented
- Direct access to all features

**Production:**
```typescript
// src/services/auth.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export const auth = getAuth();

export const loginTeacher = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Protect admin routes
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user?.role === 'admin' ? children : <Navigate to="/login" />;
};
```

### Payment Integration

**Demo:**
```typescript
// Mock payment always succeeds
export const initiatePayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    transactionId: `TXN_${Date.now()}`
  };
};
```

**Production:**
```typescript
// Integration with Razorpay
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

export const initiatePayment = async (request: PaymentRequest) => {
  const order = await razorpay.orders.create({
    amount: parseInt(request.amount) * 100, // Convert to paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`
  });
  
  return {
    orderId: order.id,
    // Other payment details
  };
};
```

## Additional Production Features

1. **Email Notifications:**
```typescript
// Using Firebase Cloud Functions
export const sendConfirmationEmail = functions.firestore
  .document('students/{studentId}')
  .onCreate(async (snap, context) => {
    const student = snap.data();
    await sendEmail({
      to: student.email,
      template: 'welcome',
      data: {
        name: student.name,
        batchDetails: student.batch_type
      }
    });
  });
```

2. **Attendance Tracking:**
```typescript
// Track daily attendance
export const markAttendance = async (studentId: string, date: string, status: 'present' | 'absent') => {
  const attendanceRef = collection(db, 'attendance');
  await addDoc(attendanceRef, {
    studentId,
    date,
    status,
    markedBy: auth.currentUser?.uid,
    timestamp: serverTimestamp()
  });
};
```

3. **Progress Reports:**
```typescript
// Generate monthly progress reports
export const generateReport = async (studentId: string, month: string) => {
  const attendanceQuery = query(
    collection(db, 'attendance'),
    where('studentId', '==', studentId),
    where('month', '==', month)
  );
  
  const performanceQuery = query(
    collection(db, 'performance'),
    where('studentId', '==', studentId),
    where('month', '==', month)
  );

  // Fetch and compile data
  const [attendance, performance] = await Promise.all([
    getDocs(attendanceQuery),
    getDocs(performanceQuery)
  ]);

  // Generate PDF report
  // ...
};
```

## Deployment

The production version is deployed on Vercel with the following configuration:

```yaml
# vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "FIREBASE_PROJECT_ID": "@firebase-project-id",
    "FIREBASE_PRIVATE_KEY": "@firebase-private-key",
    "RAZORPAY_KEY_ID": "@razorpay-key-id"
  }
}
```

## Security Considerations

1. **Firebase Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read student data
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Attendance can only be marked by teachers
    match /attendance/{attendanceId} {
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

2. **Environment Variables:**
- All sensitive keys stored in Vercel environment variables
- Different Firebase projects for development and production
- Regular key rotation for payment gateway credentials

## Monitoring and Analytics

1. **Firebase Analytics** for tracking:
- User engagement
- Popular batch timings
- Registration completion rates
- Payment success rates

2. **Error Tracking:**
```typescript
// Integration with Sentry
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

## Backup Strategy

1. **Automated Firestore Backups:**
```bash
# Cloud Function to backup Firestore daily
exports.backupFirestore = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const client = new firebaseAdmin.firestore.v1.FirestoreAdminClient();
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const bucket = 'gs://your-backup-bucket';
    
    await client.exportDocuments({
      name: `projects/${projectId}/databases/(default)`,
      outputUriPrefix: bucket,
      collectionIds: ['students', 'attendance', 'payments']
    });
  });
``` 