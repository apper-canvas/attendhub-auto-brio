import { useState, useEffect } from "react"
import ParticipantRow from "@/components/molecules/ParticipantRow"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { participantsService } from "@/services/api/participantsService"
import { attendanceService } from "@/services/api/attendanceService"

const ParticipantsList = () => {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [participantStats, setParticipantStats] = useState({})

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const participantsData = await participantsService.getAll()
      setParticipants(participantsData)

      // Load attendance stats for each participant
      const stats = {}
      for (const participant of participantsData) {
        const participantAttendanceStats = await attendanceService.getParticipantStats(participant.Id)
        stats[participant.Id] = participantAttendanceStats
      }
      setParticipantStats(stats)
    } catch (err) {
      setError("Failed to load participants. Please try again.")
      console.error("Error loading participants:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || participant.department === filterDepartment

    return matchesSearch && matchesDepartment
  })

  const uniqueDepartments = [...new Set(participants.map(participant => participant.department))]

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />
  if (participants.length === 0) return <Empty message="No participants found" />

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search participants..."
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Participant
          </Button>
        </div>
      </div>

      {/* Participants Table */}
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
                    Attendance Rate
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Summary
                  </th>
<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sessions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParticipants.map(participant => (
                  <ParticipantRow
                    key={participant.Id}
                    participant={participant}
                    attendanceStats={participantStats[participant.Id] || {}}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantsList