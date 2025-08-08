import { useState, useEffect } from "react"
import SessionCard from "@/components/molecules/SessionCard"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { sessionsService } from "@/services/api/sessionsService"
import { attendanceService } from "@/services/api/attendanceService"

const SessionsList = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [attendanceStats, setAttendanceStats] = useState({})

const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const sessionsData = await sessionsService.getAll()
      setSessions(sessionsData)

      // Load attendance stats for each session
      const stats = {}
      for (const session of sessionsData) {
        const sessionStats = await attendanceService.getSessionStats(session.Id)
        stats[session.Id] = sessionStats
      }
      setAttendanceStats(stats)
    } catch (err) {
      setError("Failed to load sessions. Please try again.")
      console.error("Error loading sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || session.type === filterType

    return matchesSearch && matchesFilter
  })

  const uniqueTypes = [...new Set(sessions.map(session => session.type))]

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />
  if (sessions.length === 0) return <Empty message="No sessions found" />

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search sessions..."
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </div>
          <Button variant="primary">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <Empty message="No sessions match your search criteria" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(session => (
            <SessionCard
              key={session.Id}
              session={session}
              attendanceStats={attendanceStats[session.Id] || {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SessionsList