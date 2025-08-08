import SessionsList from "@/components/organisms/SessionsList"

const Sessions = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-600 mt-1">Manage all your attendance sessions</p>
      </div>
      <SessionsList />
    </div>
  )
}

export default Sessions