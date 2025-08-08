import { useState, useEffect } from "react"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { attendanceService } from "@/services/api/attendanceService"
import { sessionsService } from "@/services/api/sessionsService"

const AttendanceHistoryCard = ({ participant, isOpen, onClose }) => {
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadAttendanceHistory = async () => {
    if (!participant || !isOpen) return
    
    try {
      setLoading(true)
      setError("")
      
      // Get attendance records for this participant
      const attendanceRecords = await attendanceService.getByParticipant(participant.Id)
      
      // Get session details for each attendance record
      const historyWithSessions = await Promise.all(
        attendanceRecords.map(async (record) => {
          try {
            const session = await sessionsService.getById(record.sessionId)
            return {
              ...record,
              session
            }
          } catch (err) {
            return {
              ...record,
              session: { name: "Unknown Session", date: record.timestamp?.split('T')[0] || "Unknown Date", type: "Unknown" }
            }
          }
        })
      )
      
      // Sort by session date (most recent first)
      historyWithSessions.sort((a, b) => new Date(b.session.date) - new Date(a.session.date))
      
      setAttendanceHistory(historyWithSessions)
    } catch (err) {
      setError("Failed to load attendance history. Please try again.")
      console.error("Error loading attendance history:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendanceHistory()
  }, [participant, isOpen])

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "present":
        return "success"
      case "late":
        return "warning"
      case "absent":
        return "error"
      case "excused":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "Check"
      case "late":
        return "Clock"
      case "absent":
        return "X"
      case "excused":
        return "FileText"
      default:
        return "Circle"
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance History
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {participant?.name} • {participant?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} onRetry={loadAttendanceHistory} />
          ) : attendanceHistory.length === 0 ? (
            <Empty message="No attendance history found for this participant" />
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceHistory.filter(record => record.status === "present").length}
                  </div>
                  <div className="text-sm text-gray-600">Present</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {attendanceHistory.filter(record => record.status === "late").length}
                  </div>
                  <div className="text-sm text-gray-600">Late</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceHistory.filter(record => record.status === "absent").length}
                  </div>
                  <div className="text-sm text-gray-600">Absent</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {attendanceHistory.filter(record => record.status === "excused").length}
                  </div>
                  <div className="text-sm text-gray-600">Excused</div>
                </Card>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {attendanceHistory.map((record, index) => (
                    <div key={record.Id} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className={`absolute left-6 w-4 h-4 rounded-full border-2 bg-white z-10 ${
                        record.status === "present" ? "border-green-500" :
                        record.status === "late" ? "border-yellow-500" :
                        record.status === "absent" ? "border-red-500" :
                        "border-gray-500"
                      }`}>
                        <div className={`w-2 h-2 rounded-full m-0.5 ${
                          record.status === "present" ? "bg-green-500" :
                          record.status === "late" ? "bg-yellow-500" :
                          record.status === "absent" ? "bg-red-500" :
                          "bg-gray-500"
                        }`}></div>
                      </div>
                      
                      {/* Content */}
                      <div className="ml-12 flex-1">
                        <Card className="p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {record.session.name}
                                </h4>
                                <Badge variant="outline" size="sm">
                                  {record.session.type}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <ApperIcon name="Calendar" size={14} />
                                  {formatDate(record.session.date)}
                                </div>
                                {record.timestamp && (
                                  <div className="flex items-center gap-1">
                                    <ApperIcon name="Clock" size={14} />
                                    {new Date(record.timestamp).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>
                              
                              {record.notes && (
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                  <div className="flex items-center gap-1 mb-1">
                                    <ApperIcon name="MessageSquare" size={14} />
                                    <span className="font-medium">Notes:</span>
                                  </div>
                                  {record.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-4">
                              <Badge 
                                variant={getStatusBadgeVariant(record.status)}
                                className="flex items-center gap-1"
                              >
                                <ApperIcon name={getStatusIcon(record.status)} size={14} />
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceHistoryCard