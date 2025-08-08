import attendanceData from "@/services/mockData/attendance.json"

class AttendanceService {
  constructor() {
    this.attendance = [...attendanceData]
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.attendance]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const record = this.attendance.find(a => a.Id === id)
    if (!record) {
      throw new Error("Attendance record not found")
    }
    return { ...record }
  }

  async getBySession(sessionId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return this.attendance.filter(record => record.sessionId === sessionId).map(record => ({ ...record }))
  }

  async getByParticipant(participantId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return this.attendance.filter(record => record.participantId === participantId).map(record => ({ ...record }))
  }

  async updateStatus(sessionId, participantId, status, notes = "") {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Find existing record or create new one
    let recordIndex = this.attendance.findIndex(
      record => record.sessionId === sessionId && record.participantId === participantId
    )
    
    if (recordIndex === -1) {
      // Create new record
      const newRecord = {
        Id: Math.max(...this.attendance.map(a => a.Id)) + 1,
        sessionId,
        participantId,
        status,
        timestamp: new Date().toISOString(),
        notes
      }
      this.attendance.push(newRecord)
      return { ...newRecord }
    } else {
      // Update existing record
      this.attendance[recordIndex] = {
        ...this.attendance[recordIndex],
        status,
        timestamp: new Date().toISOString(),
        notes
      }
      return { ...this.attendance[recordIndex] }
    }
  }

  async getSessionStats(sessionId) {
    await new Promise(resolve => setTimeout(resolve, 150))
    const sessionRecords = this.attendance.filter(record => record.sessionId === sessionId)
    
    const stats = {
      totalRecords: sessionRecords.length,
      presentCount: sessionRecords.filter(record => record.status === "present").length,
      absentCount: sessionRecords.filter(record => record.status === "absent").length,
      lateCount: sessionRecords.filter(record => record.status === "late").length,
      excusedCount: sessionRecords.filter(record => record.status === "excused").length
    }
    
    stats.attendanceRate = stats.totalRecords > 0 ? Math.round((stats.presentCount / stats.totalRecords) * 100) : 0
    
    return stats
  }

  async getParticipantStats(participantId) {
    await new Promise(resolve => setTimeout(resolve, 150))
    const participantRecords = this.attendance.filter(record => record.participantId === participantId)
    
    const stats = {
      totalSessions: participantRecords.length,
      presentCount: participantRecords.filter(record => record.status === "present").length,
      absentCount: participantRecords.filter(record => record.status === "absent").length,
      lateCount: participantRecords.filter(record => record.status === "late").length,
      excusedCount: participantRecords.filter(record => record.status === "excused").length
    }
    
    stats.attendanceRate = stats.totalSessions > 0 ? Math.round((stats.presentCount / stats.totalSessions) * 100) : 0
    
    return stats
  }

  async create(attendanceData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newRecord = {
      Id: Math.max(...this.attendance.map(a => a.Id)) + 1,
      ...attendanceData,
      timestamp: new Date().toISOString()
    }
    this.attendance.push(newRecord)
    return { ...newRecord }
  }

  async update(id, attendanceData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = this.attendance.findIndex(a => a.Id === id)
    if (index === -1) {
      throw new Error("Attendance record not found")
    }
    this.attendance[index] = { 
      ...this.attendance[index], 
      ...attendanceData,
      timestamp: new Date().toISOString()
    }
    return { ...this.attendance[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const index = this.attendance.findIndex(a => a.Id === id)
    if (index === -1) {
      throw new Error("Attendance record not found")
    }
    this.attendance.splice(index, 1)
    return true
  }
}

export const attendanceService = new AttendanceService()