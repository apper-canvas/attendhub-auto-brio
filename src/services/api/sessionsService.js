import sessionsData from "@/services/mockData/sessions.json"

class SessionsService {
  constructor() {
    this.sessions = [...sessionsData]
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.sessions]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const session = this.sessions.find(s => s.Id === id)
    if (!session) {
      throw new Error("Session not found")
    }
    return { ...session }
  }

  async create(sessionData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newSession = {
      Id: Math.max(...this.sessions.map(s => s.Id)) + 1,
      ...sessionData,
      participantIds: sessionData.participantIds || []
    }
    this.sessions.push(newSession)
    return { ...newSession }
  }

  async update(id, sessionData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = this.sessions.findIndex(s => s.Id === id)
    if (index === -1) {
      throw new Error("Session not found")
    }
    this.sessions[index] = { ...this.sessions[index], ...sessionData }
    return { ...this.sessions[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const index = this.sessions.findIndex(s => s.Id === id)
    if (index === -1) {
      throw new Error("Session not found")
    }
    this.sessions.splice(index, 1)
    return true
  }
}

export const sessionsService = new SessionsService()