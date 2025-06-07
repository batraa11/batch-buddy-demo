
import { useState } from "react";
import { Calendar, Clock, Users, BookOpen, CheckCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BatchRegistration from "@/components/BatchRegistration";
import StudentDashboard from "@/components/StudentDashboard";
import { useBatchData } from "@/hooks/useBatchData";

const Index = () => {
  const [view, setView] = useState<"home" | "register" | "dashboard">("home");
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const { batches, isLoading, error } = useBatchData();

  if (view === "register") {
    return <BatchRegistration selectedBatch={selectedBatch} onBack={() => setView("home")} />;
  }

  if (view === "dashboard") {
    return <StudentDashboard onBack={() => setView("home")} />;
  }

  if (error) {
    console.error('Error loading batch data:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EduBatch Academy</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setView("dashboard")}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Student Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Join Our <span className="text-blue-600">Premium Tutoring</span> Batches
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Expert guidance, flexible timings, and proven results. Choose the batch that fits your schedule.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Students Enrolled</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center mb-3">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">95%</h3>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center mb-3">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">5+</h3>
              <p className="text-gray-600">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Selection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Perfect Batch
          </h3>
          
          {isLoading ? (
            <div className="text-center">
              <p className="text-gray-600">Loading batch information...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600">Error loading batch data. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {batches.map((batch) => (
                <Card key={batch.id} className="relative hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center pb-4">
                    <div className="text-4xl mb-3">{batch.icon}</div>
                    <CardTitle className="text-xl">{batch.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{batch.time}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{batch.price}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Capacity</span>
                      <Badge variant={batch.enrolled >= batch.capacity ? "destructive" : "secondary"}>
                        {batch.enrolled}/{batch.capacity}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(batch.enrolled / batch.capacity) * 100}%` }}
                      ></div>
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        setSelectedBatch(batch.batch_type);
                        setView("register");
                      }}
                      disabled={batch.enrolled >= batch.capacity}
                    >
                      {batch.enrolled >= batch.capacity ? "Batch Full" : "Register Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Need Help Choosing?
          </h3>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">info@edubatch.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
