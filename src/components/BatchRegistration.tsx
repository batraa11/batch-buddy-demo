import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, CreditCard, CheckCircle, Send, Sparkles, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { registerStudent, checkEmailExists, Student } from "@/services/database";
import { useBatchData } from "@/hooks/useBatchData";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { initiatePayment } from "@/services/payment";

// Fun messages for different times of day
const getTimeBasedMessage = () => {
  const hour = new Date().getHours();
  const messages = {
    morning: [
      "🌅 Rise and shine! Ready to learn?",
      "☀️ Morning is the best time to start something new!",
      "🌞 Early bird gets the knowledge!"
    ],
    afternoon: [
      "☀️ Perfect time to invest in yourself!",
      "🎯 Your future self will thank you!",
      "💪 Let's make this afternoon count!"
    ],
    evening: [
      "🌙 Night owl learning session?",
      "✨ The best investment in your evening!",
      "🌠 Dreams begin with decisions like this!"
    ]
  };
  
  if (hour < 12) return messages.morning[Math.floor(Math.random() * messages.morning.length)];
  if (hour < 17) return messages.afternoon[Math.floor(Math.random() * messages.afternoon.length)];
  return messages.evening[Math.floor(Math.random() * messages.evening.length)];
};

// Encouraging messages for form validation
const getEncouragingMessage = (field: string) => {
  const messages = {
    name: [
      "Looking good! 👋",
      "Nice to meet you! ✨",
      "Great name! 🌟"
    ],
    email: [
      "Perfect! We'll keep in touch! 📧",
      "You'll get all the updates here! ✉️",
      "Great way to stay connected! 🔔"
    ],
    phone: [
      "Awesome! Quick updates coming your way! 📱",
      "Perfect for class notifications! 💬",
      "We'll send you learning tips here! 📲"
    ]
  };
  
  return messages[field as keyof typeof messages]?.[Math.floor(Math.random() * 3)] || "Looking good! ✨";
};

interface BatchRegistrationProps {
  selectedBatch: string | null;
  onBack: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

interface FormValues {
  name: string;
  email: string;
  phone: string;
  paymentMethod: string;
}

const BatchRegistration = ({ selectedBatch, onBack }: BatchRegistrationProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { batches, isLoading: batchesLoading } = useBatchData();
  
  const selectedBatchDetails = batches.find(batch => batch.batch_type === selectedBatch);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name's a bit too short! 😅")
      .max(50, "Whoa, that's a long name! 😮")
      .required("We'd love to know your name! 🙏"),
    email: Yup.string()
      .email("Hmm, this email looks a bit off 🤔")
      .required("Drop us your email so we can stay in touch! ✉️"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Just the 10 digits please! 📱")
      .required("How else would we send you class updates? 📞"),
    paymentMethod: Yup.string().required("Pick your preferred way to pay! 💳")
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      paymentMethod: "upi"
    },
    validationSchema,
    onSubmit: async (values: FormValues) => {
      if (!selectedBatch) {
        toast.error("Please select a batch to continue 😅");
        return;
      }

      setIsSubmitting(true);
      const loadingToast = toast.loading("Processing your registration... 🎯");
      
      try {
        // Check if email already exists
        const emailExists = await checkEmailExists(values.email);
        if (emailExists) {
          toast.dismiss(loadingToast);
          toast.error("This email is already registered! Try logging in instead 🤔");
          setIsSubmitting(false);
          return;
        }

        // Check batch capacity
        if (selectedBatchDetails && 
            selectedBatchDetails.enrolled >= selectedBatchDetails.capacity) {
          toast.dismiss(loadingToast);
          toast.error("This batch is now full. Please choose another batch! 🎯");
          setIsSubmitting(false);
          return;
        }

        // Process payment first
        const paymentResponse = await initiatePayment({
          amount: selectedBatchDetails?.price || "0",
          currency: "INR",
          description: `Registration for ${selectedBatchDetails?.name || "Batch"}`,
          email: values.email,
          method: values.paymentMethod as 'upi' | 'card'
        });

        if (!paymentResponse.success) {
          throw new Error("Payment failed");
        }

        // Save student data
        await registerStudent({
          name: values.name,
          email: values.email,
          phone: values.phone,
          batch_type: selectedBatch as 'morning' | 'evening' | 'full' | 'private',
          payment_method: values.paymentMethod,
          registration_date: new Date().toISOString(),
          referral_source: 'direct'
        });

        toast.dismiss(loadingToast);
        celebrateSuccess();
        toast.success("Welcome to EduBatch Academy! 🎉");
        setStep(4);
        
      } catch (error: any) {
        console.error("Registration failed:", error);
        toast.dismiss(loadingToast);
        toast.error("Something went wrong. Please try again! 🔄");
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Show encouraging messages when fields are valid
  useEffect(() => {
    Object.keys(formik.values).forEach(field => {
      if (formik.touched[field] && !formik.errors[field] && formik.values[field]) {
        toast(getEncouragingMessage(field), {
          icon: "✨",
          duration: 2000,
          position: "bottom-right"
        });
      }
    });
  }, [formik.touched, formik.errors, formik.values]);

  useEffect(() => {
    // Show a fun welcome message
    if (step === 1) {
      toast(getTimeBasedMessage(), {
        icon: "✨",
        duration: 3000
      });
    }
  }, []);

  // Celebrate successful registration
  const celebrateSuccess = () => {
    setShowConfetti(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      
      const loadingToast = toast.loading(
        formik.values.paymentMethod === 'upi' 
          ? "Redirecting to UPI payment..." 
          : "Processing card payment..."
      );

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await initiatePayment({
        amount: selectedBatchDetails?.price || "0",
        currency: "INR",
        description: `Registration for ${selectedBatchDetails?.name || "Batch"}`,
        email: formik.values.email,
        method: formik.values.paymentMethod as 'upi' | 'card'
      });

      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success("Payment successful! 🎉");
        await formik.submitForm();
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error("Payment failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Enhance the form fields with micro-interactions
  const renderFormField = (field: keyof FormValues, label: string, type: string = "text", placeholder: string) => (
    <motion.div 
      className="space-y-2"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <Label htmlFor={field} className="flex items-center space-x-2">
        <span>{label}</span>
        {formik.touched[field] && !formik.errors[field] && formik.values[field] && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            ✨
          </motion.span>
        )}
      </Label>
      <div className="relative">
        <Input
          id={field}
          name={field}
          type={type}
          placeholder={placeholder}
          value={formik.values[field]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`transition-all duration-300 ${
            formik.touched[field] && formik.errors[field]
              ? "border-red-500 bg-red-50"
              : formik.touched[field] && !formik.errors[field] && formik.values[field]
              ? "border-green-500 bg-green-50"
              : ""
          }`}
        />
        {formik.touched[field] && formik.errors[field] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-1 flex items-center space-x-1"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{formik.errors[field]}</span>
          </motion.p>
        )}
      </div>
    </motion.div>
  );

  const renderPaymentMethods = () => (
    <div className="grid grid-cols-1 gap-4">
      <Label className="text-lg font-medium mb-2">Choose Payment Method</Label>
      <div className="space-y-4">
        <div
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
            formik.values.paymentMethod === "upi"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-200"
          }`}
          onClick={() => formik.setFieldValue("paymentMethod", "upi")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="#061F3D"/>
                <path d="M15.697 7.004c-.222-.222-.582-.222-.804 0l-4.8 4.8c-.222.222-.222.582 0 .804l4.8 4.8c.222.222.582.222.804 0 .222-.222.222-.582 0-.804L11.3 12l4.397-4.197c.222-.222.222-.582 0-.8z" fill="#061F3D"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">UPI Payment</p>
              <p className="text-sm text-gray-500">Pay using any UPI app</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {["PhonePe", "GPay", "Paytm"].map((app) => (
              <img
                key={app}
                src={`/images/${app.toLowerCase()}.svg`}
                alt={`${app} logo`}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = `/images/upi-fallback.svg`;
                  e.currentTarget.onerror = null;
                }}
              />
            ))}
          </div>
        </div>

        <div
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
            formik.values.paymentMethod === "card"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-200"
          }`}
          onClick={() => formik.setFieldValue("paymentMethod", "card")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Card Payment</p>
              <p className="text-sm text-gray-500">Credit or Debit card</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {["visa", "mastercard"].map((card) => (
              <img
                key={card}
                src={`/images/${card}.svg`}
                alt={`${card} logo`}
                className="h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.src = `/images/card-fallback.svg`;
                  e.currentTarget.onerror = null;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (batchesLoading || !selectedBatchDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-200" />
          <div className="h-4 w-32 bg-blue-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with animation */}
      <motion.header 
        className="bg-white shadow-sm border-b"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Batch Registration</h1>
          </div>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Animated Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <motion.div 
              key={stepNumber} 
              className="flex items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: step >= stepNumber ? 1 : 0.8,
                opacity: 1 
              }}
              transition={{ delay: stepNumber * 0.1 }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {step > stepNumber ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </motion.div>
                ) : stepNumber}
              </div>
              {stepNumber < 4 && (
                <motion.div 
                  className={`w-16 h-1 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: stepNumber * 0.1 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Animated Content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            custom={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {/* Step 1: Batch Confirmation */}
            {step === 1 && (
              <Card className="overflow-hidden">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardHeader className="text-center">
                    <motion.div 
                      className="text-6xl mb-4"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      {selectedBatchDetails.icon}
                    </motion.div>
                    <CardTitle className="text-2xl">{selectedBatchDetails.name}</CardTitle>
                    <CardDescription>{selectedBatchDetails.time}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div 
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="text-3xl font-bold text-blue-600">{selectedBatchDetails.price}</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-blue-50 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="font-semibold text-blue-900 mb-2">What's Included:</h4>
                      <ul className="text-blue-800 space-y-1">
                        {[
                          "Expert tutoring sessions",
                          "Study materials provided",
                          "Regular progress assessments",
                          "Doubt clearing sessions",
                          "WhatsApp support group"
                        ].map((item, index) => (
                          <motion.li
                            key={item}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-2"
                          >
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div 
                      className="bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className="text-yellow-800 text-sm flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          <strong>Available Spots:</strong> {selectedBatchDetails.capacity - selectedBatchDetails.enrolled} out of {selectedBatchDetails.capacity} remaining
                        </span>
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button onClick={() => setStep(2)} className="w-full" size="lg">
                        Continue Registration
                      </Button>
                    </motion.div>
                  </CardContent>
                </motion.div>
              </Card>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Details</span>
                  </CardTitle>
                  <CardDescription>
                    Join our learning community! 🎓
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {renderFormField("name", "Full Name", "text", "What should we call you?")}
                    {renderFormField("email", "Email Address", "email", "Where should we send updates?")}
                    {renderFormField("phone", "Phone Number", "tel", "For quick class updates!")}
                    
                    <div className="space-y-2">
                      {renderPaymentMethods()}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting || !formik.isValid}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-4 w-4" />
                            </motion.div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>Complete Registration</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Simulation */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment (Demo)</span>
                  </CardTitle>
                  <CardDescription>Simulated payment process - No real transaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Demo Mode:</strong> This is a simulated payment process. No real money will be charged.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="flex justify-between items-center">
                      <span>{selectedBatchDetails.name}</span>
                      <span className="font-semibold">{selectedBatchDetails.price}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>{selectedBatchDetails.price}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Choose Payment Method</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={formik.values.paymentMethod === "upi" ? "default" : "outline"}
                        onClick={() => formik.setFieldValue("paymentMethod", "upi")}
                        className="h-16"
                      >
                        <div className="text-center">
                          <div className="text-lg">📱</div>
                          <div className="text-sm">UPI/GPay</div>
                        </div>
                      </Button>
                      <Button
                        variant={formik.values.paymentMethod === "card" ? "default" : "outline"}
                        onClick={() => formik.setFieldValue("paymentMethod", "card")}
                        className="h-16"
                      >
                        <div className="text-center">
                          <div className="text-lg">💳</div>
                          <div className="text-sm">Card</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handlePayment} className="flex-1">
                      Pay Now (Demo)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <Card className="text-center">
                <CardContent className="pt-8 pb-8 space-y-6">
                  <div className="text-6xl">🎉</div>
                  <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-left">
                    <h4 className="font-semibold text-green-900 mb-2">What happens next:</h4>
                    <ul className="text-green-800 space-y-2">
                      <li className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Your registration has been saved to our database</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>You'll receive a call within 24 hours</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>First class details will be shared</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Student:</strong> {formik.values.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Batch:</strong> {selectedBatchDetails.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Time:</strong> {selectedBatchDetails.time}
                    </p>
                  </div>

                  <Button onClick={onBack} className="w-full" size="lg">
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BatchRegistration;
