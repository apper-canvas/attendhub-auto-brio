import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import AttendanceCell from "@/components/molecules/AttendanceCell"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { attendanceService } from "@/services/api/attendanceService"
import { participantsService } from "@/services/api/participantsService"
import { sessionsService } from "@/services/api/sessionsService"
import { toast } from "react-toastify"

const AttendanceTable = () => {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [participants, setParticipants] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [sessionData, participantsData, attendanceData] = await Promise.all([
        sessionsService.getById(parseInt(sessionId)),
        participantsService.getAll(),
        attendanceService.getBySession(parseInt(sessionId))
      ])

      setSession(sessionData)
      
      // Handle participant IDs from database field
      const sessionParticipantIds = sessionData.participant_ids_c || sessionData.participantIds || []
      const participantIdsArray = Array.isArray(sessionParticipantIds) ? 
        sessionParticipantIds : 
        typeof sessionParticipantIds === 'string' ? 
          sessionParticipantIds.split(',').map(id => parseInt(id.trim())) : []
      
      setParticipants(participantsData.filter(p => 
        participantIdsArray.includes(p.Id)
      ))

      // Convert attendance array to lookup object
      const attendanceMap = {}
      attendanceData.forEach(record => {
        const participantId = record.participant_id_c?.Id || record.participant_id_c || record.participantId
        const status = record.status_c || record.status
        attendanceMap[participantId] = status
      })
      setAttendance(attendanceMap)
    } catch (err) {
      setError("Failed to load attendance data. Please try again.")
      console.error("Error loading attendance:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadData()
    }
  }, [sessionId])

  const handleStatusChange = async (participantId, currentStatus) => {
    const statusCycle = ["present", "absent", "late", "excused"]
    const currentIndex = statusCycle.indexOf(currentStatus) || -1
    const newStatus = statusCycle[(currentIndex + 1) % statusCycle.length]

    try {
      await attendanceService.updateStatus(parseInt(sessionId), participantId, newStatus)
      setAttendance(prev => ({
        ...prev,
        [participantId]: newStatus
      }))
      toast.success("Attendance updated successfully")
    } catch (err) {
      toast.error("Failed to update attendance")
      console.error("Error updating attendance:", err)
    }
  }

  const handleBulkAction = async (status) => {
    try {
      const updates = filteredParticipants.map(participant => 
        attendanceService.updateStatus(parseInt(sessionId), participant.Id, status)
      )
      await Promise.all(updates)

      const newAttendance = { ...attendance }
      filteredParticipants.forEach(participant => {
        newAttendance[participant.Id] = status
      })
      setAttendance(newAttendance)
      toast.success(`Marked all visible participants as ${status}`)
    } catch (err) {
      toast.error("Failed to update attendance")
      console.error("Error with bulk update:", err)
    }
  }

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === "all") return matchesSearch
    
    const participantStatus = attendance[participant.Id] || "unmarked"
    return matchesSearch && participantStatus === filterStatus
  })

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />
  if (!session) return <Empty message="Session not found" />

  const stats = {
    total: participants.length,
    present: Object.values(attendance).filter(status => status === "present").length,
    absent: Object.values(attendance).filter(status => status === "absent").length,
    late: Object.values(attendance).filter(status => status === "late").length,
    excused: Object.values(attendance).filter(status => status === "excused").length
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="bg-gradient-to-r from-white to-blue-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(session.date).toLocaleDateString()} • {session.type}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {Math.round((stats.present / stats.total) * 100) || 0}%
            </div>
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success-500">{stats.present}</div>
            <div className="text-sm text-gray-500">Present</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-error-500">{stats.absent}</div>
            <div className="text-sm text-gray-500">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-warning-500">{stats.late}</div>
            <div className="text-sm text-gray-500">Late</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">{stats.excused}</div>
            <div className="text-sm text-gray-500">Excused</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search participants..."
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
                <option value="unmarked">Unmarked</option>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleBulkAction("present")}
            >
              Mark All Present
            </Button>
            <Button
              variant="error"
              size="sm"
              onClick={() => handleBulkAction("absent")}
            >
              Mark All Absent
            </Button>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-success-500 to-green-600 mr-2 text-white font-bold text-xs flex items-center justify-center">P</div>
            Present
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-error-500 to-red-600 mr-2 text-white font-bold text-xs flex items-center justify-center">A</div>
            Absent
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-warning-500 to-yellow-600 mr-2 text-white font-bold text-xs flex items-center justify-center">L</div>
            Late
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-blue-600 mr-2 text-white font-bold text-xs flex items-center justify-center">E</div>
            Excused
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-200 mr-2 text-gray-600 font-bold text-xs flex items-center justify-center">?</div>
            Unmarked
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Click on any cell to cycle through status options</p>
      </div>

      {/* Attendance Grid */}
      {filteredParticipants.length === 0 ? (
        <Empty message="No participants match your search criteria" />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParticipants.map(participant => (
                  <tr key={participant.Id} className="hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">{participant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <AttendanceCell
                        status={attendance[participant.Id]}
                        onClick={handleStatusChange}
                        participant={participant}
                        session={session}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceTable