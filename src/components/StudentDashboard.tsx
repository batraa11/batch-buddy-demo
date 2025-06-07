
import { useState } from "react";
import { ArrowLeft, Calendar, Clock, BookOpen, MessageSquare, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentDashboardProps {
  onBack: () => void;
}

const StudentDashboard = ({ onBack }: StudentDashboardProps) => {
  const [activeDate] = useState(new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  const todaySchedule = [
    {
      time: "5:30 AM - 7:30 AM",
      subject: "Mathematics",
      batch: "Morning Batch",
      teacher: "Mr. Sharma",
      status: "ongoing",
      topics: ["Calculus", "Derivatives", "Integration"]
    },
    {
      time: "3:30 PM - 5:30 PM", 
      subject: "Physics",
      batch: "Evening Batch",
      teacher: "Ms. Patel",
      status: "upcoming",
      topics: ["Electromagnetic Waves", "Optics"]
    }
  ];

  const recentNotes = [
    {
      id: 1,
      date: "Today",
      teacher: "Mr. Sharma",
      subject: "Mathematics",
      message: "Tomorrow we'll be covering advanced integration techniques. Please review the basic integration formulas we discussed today.",
      priority: "normal"
    },
    {
      id: 2,
      date: "Yesterday",
      teacher: "Ms. Patel",
      subject: "Physics",
      message: "Great progress in today's optics lesson! Remember to practice the ray diagram problems for better understanding.",
      priority: "high"
    },
    {
      id: 3,
      date: "2 days ago",
      teacher: "Mr. Sharma", 
      subject: "Mathematics",
      message: "Test scheduled for next week on Calculus. Study materials have been shared in the WhatsApp group.",
      priority: "high"
    }
  ];

  const batchStats = {
    morningBatch: {
      name: "Morning Batch",
      enrolled: 15,
      present: 13,
      attendance: 87
    },
    eveningBatch: {
      name: "Evening Batch", 
      enrolled: 18,
      present: 16,
      attendance: 89
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">{activeDate}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Today's Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Teacher Notes</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Batch Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Today's Schedule */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid gap-6">
              <h2 className="text-xl font-semibold text-gray-900">Today's Classes</h2>
              
              {todaySchedule.map((session, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{session.time}</span>
                        </div>
                        <Badge variant={session.status === "ongoing" ? "default" : "secondary"}>
                          {session.status === "ongoing" ? "Live Now" : "Upcoming"}
                        </Badge>
                      </div>
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <CardTitle className="text-xl">{session.subject}</CardTitle>
                    <CardDescription>
                      {session.batch} • {session.teacher}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Today's Topics:</h4>
                        <div className="flex flex-wrap gap-2">
                          {session.topics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {session.status === "ongoing" && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-green-800 text-sm font-medium">
                            🔴 Class is currently live. Join the session if you haven't already!
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Teacher Notes */}
          <TabsContent value="notes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Teacher Notes</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <Card key={note.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={note.priority === "high" ? "destructive" : "secondary"}>
                          {note.priority === "high" ? "Important" : "Note"}
                        </Badge>
                        <span className="text-sm text-gray-600">{note.date}</span>
                      </div>
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                    </div>
                    <CardTitle className="text-lg">
                      {note.subject} • {note.teacher}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{note.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Batch Statistics */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Batch Statistics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {Object.values(batchStats).map((batch, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>{batch.name}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{batch.enrolled}</p>
                        <p className="text-sm text-gray-600">Total Enrolled</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{batch.present}</p>
                        <p className="text-sm text-gray-600">Present Today</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Average Attendance</span>
                        <span className="text-sm font-medium">{batch.attendance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${batch.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Live Data</h3>
                    <p className="text-blue-800 text-sm">
                      These statistics are updated in real-time as students join and leave batches.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
