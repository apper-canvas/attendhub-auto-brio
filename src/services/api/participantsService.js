import participantsData from "@/services/mockData/participants.json"

class ParticipantsService {
  constructor() {
    this.participants = [...participantsData]
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 250))
    return [...this.participants]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const participant = this.participants.find(p => p.Id === id)
    if (!participant) {
      throw new Error("Participant not found")
    }
    return { ...participant }
  }

  async create(participantData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newParticipant = {
      Id: Math.max(...this.participants.map(p => p.Id)) + 1,
      ...participantData
    }
    this.participants.push(newParticipant)
    return { ...newParticipant }
  }

  async update(id, participantData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = this.participants.findIndex(p => p.Id === id)
    if (index === -1) {
      throw new Error("Participant not found")
    }
    this.participants[index] = { ...this.participants[index], ...participantData }
    return { ...this.participants[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const index = this.participants.findIndex(p => p.Id === id)
    if (index === -1) {
      throw new Error("Participant not found")
    }
    this.participants.splice(index, 1)
    return true
  }
}

export const participantsService = new ParticipantsService()