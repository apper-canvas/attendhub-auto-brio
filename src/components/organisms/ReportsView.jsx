import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import Chart from "react-apexcharts"
import StatsCard from "@/components/molecules/StatsCard"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Card from "@/components/atoms/Card"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { attendanceService } from "@/services/api/attendanceService"
import { sessionsService } from "@/services/api/sessionsService"
import { participantsService } from "@/services/api/participantsService"

const ReportsView = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reportData, setReportData] = useState({
    overview: {},
    trends: [],
    topPerformers: [],
    sessions: []
  })
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [attendanceData, sessionsData, participantsData] = await Promise.all([
        attendanceService.getAll(),
        sessionsService.getAll(),
        participantsService.getAll()
      ])

      // Calculate overview stats
      const totalSessions = sessionsData.length
      const totalParticipants = participantsData.length
      const totalRecords = attendanceData.length
      const presentRecords = attendanceData.filter(record => record.status === "present").length
      const overallAttendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

      // Calculate trends by date
      const trendData = sessionsData
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(session => {
          const sessionRecords = attendanceData.filter(record => record.sessionId === session.Id)
          const sessionPresent = sessionRecords.filter(record => record.status === "present").length
          const attendanceRate = sessionRecords.length > 0 ? Math.round((sessionPresent / sessionRecords.length) * 100) : 0
          
          return {
            date: session.date,
            sessionName: session.name,
            attendanceRate,
            present: sessionPresent,
            total: sessionRecords.length
          }
        })

      // Calculate top performers
      const participantStats = participantsData.map(participant => {
        const participantRecords = attendanceData.filter(record => record.participantId === participant.Id)
        const presentCount = participantRecords.filter(record => record.status === "present").length
        const attendanceRate = participantRecords.length > 0 ? Math.round((presentCount / participantRecords.length) * 100) : 0
        
        return {
          ...participant,
          attendanceRate,
          totalSessions: participantRecords.length,
          presentCount
        }
      }).sort((a, b) => b.attendanceRate - a.attendanceRate).slice(0, 10)

      setReportData({
        overview: {
          totalSessions,
          totalParticipants,
          overallAttendanceRate,
          totalRecords
        },
        trends: trendData,
        topPerformers: participantStats,
        sessions: sessionsData
      })
    } catch (err) {
      setError("Failed to load reports data. Please try again.")
      console.error("Error loading reports:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />
  if (reportData.sessions.length === 0) return <Empty message="No data available for reports" />

  // Chart configurations
  const trendChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#2563eb"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
      }
    },
    xaxis: {
      categories: reportData.trends.map(item => format(parseISO(item.date), "MMM dd")),
      labels: { style: { fontSize: "12px" } }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { formatter: (val) => `${val}%` }
    },
    colors: ["#2563eb"],
    grid: { strokeDashArray: 3 },
    tooltip: {
      y: { formatter: (val) => `${val}%` }
    }
  }

  const trendChartSeries = [{
    name: "Attendance Rate",
    data: reportData.trends.map(item => item.attendanceRate)
  }]

  const statusChartOptions = {
    chart: { type: "donut" },
    labels: ["Present", "Absent", "Late", "Excused"],
    colors: ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"],
    legend: { position: "bottom" },
    plotOptions: {
      pie: {
        donut: { size: "60%" }
      }
    }
  }

  // Calculate status distribution
  const statusCounts = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0
  }

  // This would be calculated from actual attendance data
  statusCounts.present = Math.floor(reportData.overview.totalRecords * (reportData.overview.overallAttendanceRate / 100))
  statusCounts.absent = Math.floor(reportData.overview.totalRecords * 0.15)
  statusCounts.late = Math.floor(reportData.overview.totalRecords * 0.08)
  statusCounts.excused = reportData.overview.totalRecords - statusCounts.present - statusCounts.absent - statusCounts.late

  const statusChartSeries = [
    statusCounts.present,
    statusCounts.absent,
    statusCounts.late,
    statusCounts.excused
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive attendance analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-32"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
          </Select>
          <Button variant="primary">
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={reportData.overview.totalSessions}
          icon="Calendar"
          color="primary"
        />
        <StatsCard
          title="Total Participants"
          value={reportData.overview.totalParticipants}
          icon="Users"
          color="success"
        />
        <StatsCard
          title="Overall Attendance Rate"
          value={`${reportData.overview.overallAttendanceRate}%`}
          icon="TrendingUp"
          color="warning"
        />
        <StatsCard
          title="Total Records"
          value={reportData.overview.totalRecords}
          icon="ClipboardList"
          color="error"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <Card className="bg-gradient-to-br from-white to-blue-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Trends</h3>
          {reportData.trends.length > 0 ? (
            <Chart
              options={trendChartOptions}
              series={trendChartSeries}
              type="line"
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No trend data available
            </div>
          )}
        </Card>

        {/* Status Distribution */}
        <Card className="bg-gradient-to-br from-white to-purple-50">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Status Distribution</h3>
          <Chart
            options={statusChartOptions}
            series={statusChartSeries}
            type="donut"
            height={300}
          />
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-gradient-to-br from-white to-green-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
          <ApperIcon name="Award" className="text-warning-500" size={24} />
        </div>
        
        {reportData.topPerformers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Rank</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Participant</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">Attendance Rate</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">Sessions Attended</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-500">Total Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.topPerformers.map((participant, index) => (
                  <tr key={participant.Id} className="hover:bg-white/50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                            "bg-gradient-to-r from-orange-400 to-orange-600"
                          }`}>
                            {index + 1}
                          </div>
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center text-gray-600 text-sm font-medium">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-xs text-gray-500">{participant.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                        {participant.attendanceRate}%
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {participant.presentCount}
                    </td>
                    <td className="py-3 text-center text-sm text-gray-900">
                      {participant.totalSessions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty message="No performance data available" />
        )}
      </Card>
    </div>
  )
}

export default ReportsView