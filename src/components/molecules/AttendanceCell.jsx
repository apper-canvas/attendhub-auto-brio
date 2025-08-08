import { cn } from "@/utils/cn"

const AttendanceCell = ({ status, onClick, participant, session }) => {
  const statusClasses = {
    present: "bg-gradient-to-r from-success-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
    absent: "bg-gradient-to-r from-error-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
    late: "bg-gradient-to-r from-warning-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700",
    excused: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
    unmarked: "bg-gray-100 border-2 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
  }

  const statusLabels = {
    present: "P",
    absent: "A",
    late: "L",
    excused: "E",
    unmarked: "?"
  }

  return (
    <button
      onClick={() => onClick(participant.Id, status)}
      className={cn(
        "w-12 h-12 rounded-md font-bold text-sm transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
        statusClasses[status || "unmarked"]
      )}
      title={`${participant.name} - ${status || "Not marked"}`}
    >
      {statusLabels[status || "unmarked"]}
    </button>
  )
}

export default AttendanceCell