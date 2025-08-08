import React, { useState } from "react";
import AttendanceHistoryCard from "@/components/molecules/AttendanceHistoryCard";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
const ParticipantRow = ({ participant, attendanceStats }) => {
  const [showHistory, setShowHistory] = useState(false)
  const { totalSessions = 0, presentCount = 0, absentCount = 0, lateCount = 0 } = attendanceStats || {}
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

return (
    <>
      <tr className="hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all duration-200">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {(participant.Name || participant.name).charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{participant.Name || participant.name}</div>
              <div className="text-sm text-gray-500">{participant.email_c || participant.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{participant.department_c || participant.department}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            {attendanceRate}%
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex justify-center space-x-2">
            <Badge variant="present">{presentCount}</Badge>
            <Badge variant="absent">{absentCount}</Badge>
            <Badge variant="late">{lateCount}</Badge>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
          {totalSessions}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1 text-xs"
          >
            <ApperIcon name="History" size={14} />
            View History
          </Button>
        </td>
      </tr>
      
      <AttendanceHistoryCard
        participant={participant}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  )
}

export default ParticipantRow