import ParticipantsList from "@/components/organisms/ParticipantsList"

const Participants = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
        <p className="text-gray-600 mt-1">Manage all participants and view their attendance statistics</p>
      </div>
      <ParticipantsList />
    </div>
  )
}

export default Participants