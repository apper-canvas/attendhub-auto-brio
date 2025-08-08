class AttendanceService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = "attendance_c"
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "session_id_c" } },
          { field: { Name: "participant_id_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "notes_c" } }
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching attendance records:", error?.response?.data?.message)
      } else {
        console.error("Error fetching attendance records:", error.message)
      }
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "session_id_c" } },
          { field: { Name: "participant_id_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "notes_c" } }
        ]
      }

      const response = await this.apperClient.getRecordById(this.tableName, id, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching attendance record with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error("Error fetching attendance record:", error.message)
      }
      return null
    }
  }

  async getBySession(sessionId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "session_id_c" } },
          { field: { Name: "participant_id_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [
          {
            FieldName: "session_id_c",
            Operator: "EqualTo",
            Values: [sessionId]
          }
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching attendance by session:", error?.response?.data?.message)
      } else {
        console.error("Error fetching attendance by session:", error.message)
      }
      return []
    }
  }

  async getByParticipant(participantId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "session_id_c" } },
          { field: { Name: "participant_id_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [
          {
            FieldName: "participant_id_c",
            Operator: "EqualTo",
            Values: [participantId]
          }
        ],
        pagingInfo: { limit: 1000, offset: 0 }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching attendance by participant:", error?.response?.data?.message)
      } else {
        console.error("Error fetching attendance by participant:", error.message)
      }
      return []
    }
  }

  async updateStatus(sessionId, participantId, status, notes = "") {
    try {
      // First check if record exists
      const existingRecords = await this.getBySession(sessionId)
      const existingRecord = existingRecords.find(record => 
        (record.participant_id_c?.Id || record.participant_id_c) === participantId
      )

      if (existingRecord) {
        // Update existing record
        const params = {
          records: [{
            Id: existingRecord.Id,
            status_c: status,
            timestamp_c: new Date().toISOString(),
            notes_c: notes
          }]
        }

        const response = await this.apperClient.updateRecord(this.tableName, params)
        
        if (!response.success) {
          console.error(response.message)
          throw new Error(response.message)
        }

        if (response.results) {
          const successfulUpdates = response.results.filter(result => result.success)
          const failedUpdates = response.results.filter(result => !result.success)
          
          if (failedUpdates.length > 0) {
            console.error(`Failed to update attendance ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
            failedUpdates.forEach(record => {
              record.errors?.forEach(error => {
                console.error(`${error.fieldLabel}: ${error.message}`)
              })
            })
          }
          
          return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
        }
      } else {
        // Create new record
        const params = {
          records: [{
            Name: `Attendance-${sessionId}-${participantId}`,
            session_id_c: sessionId,
            participant_id_c: participantId,
            status_c: status,
            timestamp_c: new Date().toISOString(),
            notes_c: notes
          }]
        }

        const response = await this.apperClient.createRecord(this.tableName, params)
        
        if (!response.success) {
          console.error(response.message)
          throw new Error(response.message)
        }

        if (response.results) {
          const successfulRecords = response.results.filter(result => result.success)
          const failedRecords = response.results.filter(result => !result.success)
          
          if (failedRecords.length > 0) {
            console.error(`Failed to create attendance ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
            failedRecords.forEach(record => {
              record.errors?.forEach(error => {
                console.error(`${error.fieldLabel}: ${error.message}`)
              })
            })
          }
          
          return successfulRecords.length > 0 ? successfulRecords[0].data : null
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating attendance status:", error?.response?.data?.message)
      } else {
        console.error("Error updating attendance status:", error.message)
      }
      throw error
    }
  }

  async getSessionStats(sessionId) {
    try {
      const sessionRecords = await this.getBySession(sessionId)
      
      const stats = {
        totalRecords: sessionRecords.length,
        presentCount: sessionRecords.filter(record => (record.status_c || record.status) === "present").length,
        absentCount: sessionRecords.filter(record => (record.status_c || record.status) === "absent").length,
        lateCount: sessionRecords.filter(record => (record.status_c || record.status) === "late").length,
        excusedCount: sessionRecords.filter(record => (record.status_c || record.status) === "excused").length
      }
      
      stats.attendanceRate = stats.totalRecords > 0 ? Math.round((stats.presentCount / stats.totalRecords) * 100) : 0
      
      return stats
    } catch (error) {
      console.error("Error getting session stats:", error.message)
      return {
        totalRecords: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: 0
      }
    }
  }

  async getParticipantStats(participantId) {
    try {
      const participantRecords = await this.getByParticipant(participantId)
      
      const stats = {
        totalSessions: participantRecords.length,
        presentCount: participantRecords.filter(record => (record.status_c || record.status) === "present").length,
        absentCount: participantRecords.filter(record => (record.status_c || record.status) === "absent").length,
        lateCount: participantRecords.filter(record => (record.status_c || record.status) === "late").length,
        excusedCount: participantRecords.filter(record => (record.status_c || record.status) === "excused").length
      }
      
      stats.attendanceRate = stats.totalSessions > 0 ? Math.round((stats.presentCount / stats.totalSessions) * 100) : 0
      
      return stats
    } catch (error) {
      console.error("Error getting participant stats:", error.message)
      return {
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: 0
      }
    }
  }

  async getParticipantAttendanceHistory(participantId) {
    try {
      const participantRecords = await this.getByParticipant(participantId)
      
      // Sort by timestamp (most recent first)
      return participantRecords.sort((a, b) => {
        const timeA = new Date(a.timestamp_c || a.timestamp || 0)
        const timeB = new Date(b.timestamp_c || b.timestamp || 0)
        return timeB - timeA
      })
    } catch (error) {
      console.error("Error getting participant attendance history:", error.message)
      return []
    }
  }

  async create(attendanceData) {
    try {
      const params = {
        records: [{
          Name: attendanceData.Name || `Attendance-${Date.now()}`,
          session_id_c: parseInt(attendanceData.session_id_c || attendanceData.sessionId),
          participant_id_c: parseInt(attendanceData.participant_id_c || attendanceData.participantId),
          status_c: attendanceData.status_c || attendanceData.status,
          timestamp_c: attendanceData.timestamp_c || attendanceData.timestamp || new Date().toISOString(),
          notes_c: attendanceData.notes_c || attendanceData.notes || ""
        }]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create attendance ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`)
            })
          })
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating attendance record:", error?.response?.data?.message)
      } else {
        console.error("Error creating attendance record:", error.message)
      }
      throw error
    }
  }

  async update(id, attendanceData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: attendanceData.Name,
          session_id_c: parseInt(attendanceData.session_id_c || attendanceData.sessionId),
          participant_id_c: parseInt(attendanceData.participant_id_c || attendanceData.participantId),
          status_c: attendanceData.status_c || attendanceData.status,
          timestamp_c: attendanceData.timestamp_c || attendanceData.timestamp || new Date().toISOString(),
          notes_c: attendanceData.notes_c || attendanceData.notes || ""
        }]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update attendance ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`)
            })
          })
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating attendance record:", error?.response?.data?.message)
      } else {
        console.error("Error updating attendance record:", error.message)
      }
      throw error
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete attendance ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting attendance record:", error?.response?.data?.message)
      } else {
        console.error("Error deleting attendance record:", error.message)
      }
      throw error
    }
  }
}

export const attendanceService = new AttendanceService()