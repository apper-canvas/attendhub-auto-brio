import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const SessionCard = ({ session, attendanceStats = {} }) => {
  const navigate = useNavigate()
  
  const { totalParticipants = 0, presentCount = 0, absentCount = 0, lateCount = 0 } = attendanceStats
  const attendanceRate = totalParticipants > 0 ? Math.round((presentCount / totalParticipants) * 100) : 0

  const handleMarkAttendance = () => {
    navigate(`/attendance/${session.Id}`)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 hover:from-white hover:to-blue-100 transform hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
<h3 className="text-lg font-bold text-gray-900 mb-1">{session.Name || session.name}</h3>
          <p className="text-sm text-gray-600 flex items-center">
            <ApperIcon name="Calendar" size={14} className="mr-1" />
            {format(new Date(session.date_c || session.date), "MMM dd, yyyy")}
          </p>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <ApperIcon name="Tag" size={14} className="mr-1" />
            {session.type_c || session.type}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            {attendanceRate}%
          </div>
          <p className="text-xs text-gray-500">Attendance</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <Badge variant="present">{presentCount} Present</Badge>
          <Badge variant="absent">{absentCount} Absent</Badge>
          <Badge variant="late">{lateCount} Late</Badge>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {totalParticipants} total participants
        </p>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleMarkAttendance}
          className="flex items-center"
        >
          <ApperIcon name="CheckSquare" size={16} className="mr-1" />
          Mark Attendance
        </Button>
      </div>
    </Card>
  )
}

export default SessionCard