"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Clock, Users, DollarSign } from "lucide-react"

export function ClassManagement() {
  // Mock class data
  const classes = [
    {
      id: "1",
      name: "Yoga Flow",
      instructor: "Emma Wilson",
      duration: 60,
      max_capacity: 12,
      price: 25.0,
      difficulty: "intermediate",
      schedule: "Mon, Wed, Fri - 9:00 AM",
      room: "Studio A",
      is_active: true,
      total_bookings: 156,
    },
    {
      id: "2",
      name: "Pilates Core",
      instructor: "Sarah Johnson",
      duration: 45,
      max_capacity: 8,
      price: 30.0,
      difficulty: "intermediate",
      schedule: "Tue, Thu - 6:30 PM",
      room: "Studio B",
      is_active: true,
      total_bookings: 89,
    },
    {
      id: "3",
      name: "Meditation",
      instructor: "Mike Chen",
      duration: 30,
      max_capacity: 15,
      price: 20.0,
      difficulty: "beginner",
      schedule: "Daily - 7:00 AM",
      room: "Zen Room",
      is_active: true,
      total_bookings: 234,
    },
    {
      id: "4",
      name: "HIIT Fitness",
      instructor: "Alex Rodriguez",
      duration: 50,
      max_capacity: 10,
      price: 35.0,
      difficulty: "advanced",
      schedule: "Mon, Wed, Fri - 7:00 AM",
      room: "Studio A",
      is_active: false,
      total_bookings: 67,
    },
  ]

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return <Badge className="bg-green-100 text-green-800">Beginner</Badge>
      case "intermediate":
        return <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
      case "advanced":
        return <Badge className="bg-red-100 text-red-800">Advanced</Badge>
      default:
        return <Badge variant="secondary">{difficulty}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Management</h2>
          <p className="text-muted-foreground">Manage your studio classes and schedules</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Classes</p>
                <p className="text-2xl font-bold">{classes.filter((c) => c.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Avg. Price</p>
                <p className="text-2xl font-bold">
                  ${(classes.reduce((sum, c) => sum + c.price, 0) / classes.length).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Bookings</p>
                <p className="text-2xl font-bold">{classes.reduce((sum, c) => sum + c.total_bookings, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>Manage your studio's class offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{classItem.name}</p>
                      <p className="text-sm text-muted-foreground">{classItem.room}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{classItem.instructor}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {classItem.duration} min
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        {classItem.max_capacity} max
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />${classItem.price}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{classItem.schedule}</p>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(classItem.difficulty)}</TableCell>
                  <TableCell>{getStatusBadge(classItem.is_active)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{classItem.total_bookings}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
