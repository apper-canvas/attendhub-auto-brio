import { useState, useEffect } from "react"
import { format, isToday } from "date-fns"
import StatsCard from "@/components/molecules/StatsCard"
import SessionCard from "@/components/molecules/SessionCard"
import Button from "@/components/atoms/Button"
import Card from "@/components/atoms/Card"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { sessionsService } from "@/services/api/sessionsService"
import { attendanceService } from "@/services/api/attendanceService"
import { participantsService } from "@/services/api/participantsService"

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    todaySessions: [],
    recentSessions: [],
    stats: {},
    attendanceStats: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      const [sessionsData, attendanceData, participantsData] = await Promise.all([
        sessionsService.getAll(),
        attendanceService.getAll(),
        participantsService.getAll()
      ])

      // Filter today's sessions
      const todaySessions = sessionsData.filter(session => 
        isToday(new Date(session.date_c || session.date))
      )

      // Get recent sessions (last 7 days)
      const recentSessions = sessionsData
        .filter(session => {
          const sessionDate = new Date(session.date_c || session.date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return sessionDate >= weekAgo
        })
        .sort((a, b) => new Date(b.date_c || b.date) - new Date(a.date_c || a.date))
        .slice(0, 6)

      // Calculate overall stats
      const totalSessions = sessionsData.length
      const totalParticipants = participantsData.length
      const totalAttendanceRecords = attendanceData.length
      const presentRecords = attendanceData.filter(record => (record.status_c || record.status) === "present").length
      const overallAttendanceRate = totalAttendanceRecords > 0 
        ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
        : 0

      // Calculate attendance stats for each session
      const attendanceStats = {}
      for (const session of [...todaySessions, ...recentSessions]) {
        const sessionAttendance = attendanceData.filter(record => 
          (record.session_id_c?.Id || record.session_id_c || record.sessionId) === session.Id
        )
        const sessionParticipantIds = session.participant_ids_c || session.participantIds || []
        const sessionParticipants = Array.isArray(sessionParticipantIds) ? sessionParticipantIds.length : 
                                  typeof sessionParticipantIds === 'string' ? sessionParticipantIds.split(',').length : 0
        const presentCount = sessionAttendance.filter(record => (record.status_c || record.status) === "present").length
        const absentCount = sessionAttendance.filter(record => (record.status_c || record.status) === "absent").length
        const lateCount = sessionAttendance.filter(record => (record.status_c || record.status) === "late").length
        
        attendanceStats[session.Id] = {
          totalParticipants: sessionParticipants,
          presentCount,
          absentCount,
          lateCount,
          attendanceRate: sessionParticipants > 0 ? Math.round((presentCount / sessionParticipants) * 100) : 0
        }
      }

      setDashboardData({
        todaySessions,
        recentSessions,
        stats: {
          totalSessions,
          totalParticipants,
          overallAttendanceRate,
          todaySessionsCount: todaySessions.length
        },
        attendanceStats
      })
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.")
      console.error("Error loading dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to AttendHub</h1>
            <p className="text-blue-100">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </p>
            <p className="text-blue-200 mt-1">
              {dashboardData.todaySessions.length} sessions scheduled for today
            </p>
          </div>
          <div className="hidden md:flex items-center">
            <ApperIcon name="ClipboardCheck" size={64} className="text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Sessions"
          value={dashboardData.stats.todaySessionsCount}
          icon="Calendar"
          color="primary"
          change="+2 from yesterday"
          changeType="positive"
        />
        <StatsCard
          title="Total Sessions"
          value={dashboardData.stats.totalSessions}
          icon="CalendarDays"
          color="success"
        />
        <StatsCard
          title="Total Participants"
          value={dashboardData.stats.totalParticipants}
          icon="Users"
          color="warning"
        />
        <StatsCard
          title="Overall Attendance"
          value={`${dashboardData.stats.overallAttendanceRate}%`}
          icon="TrendingUp"
          color="error"
          change={dashboardData.stats.overallAttendanceRate >= 80 ? "+5% this week" : "-3% this week"}
          changeType={dashboardData.stats.overallAttendanceRate >= 80 ? "positive" : "negative"}
        />
      </div>

      {/* Today's Sessions */}
      {dashboardData.todaySessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today's Sessions</h2>
            <Button variant="primary" size="sm">
              <ApperIcon name="Plus" size={16} className="mr-1" />
              New Session
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.todaySessions.map(session => (
              <SessionCard
                key={session.Id}
                session={session}
                attendanceStats={dashboardData.attendanceStats[session.Id] || {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
          <Button variant="outline" size="sm">
            View All Sessions
          </Button>
        </div>

        {dashboardData.recentSessions.length === 0 ? (
          <Empty 
            message="No recent sessions found" 
            description="Create your first session to get started with attendance tracking"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.recentSessions.map(session => (
              <SessionCard
                key={session.Id}
                session={session}
                attendanceStats={dashboardData.attendanceStats[session.Id] || {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <ApperIcon name="Zap" className="text-primary-500" size={24} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="primary" className="h-16 flex-col">
            <ApperIcon name="Plus" size={20} className="mb-1" />
            Create Session
          </Button>
          <Button variant="secondary" className="h-16 flex-col">
            <ApperIcon name="UserPlus" size={20} className="mb-1" />
            Add Participant
          </Button>
          <Button variant="outline" className="h-16 flex-col">
            <ApperIcon name="CheckSquare" size={20} className="mb-1" />
            Quick Mark
          </Button>
          <Button variant="outline" className="h-16 flex-col">
            <ApperIcon name="Download" size={20} className="mb-1" />
            Export Data
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard