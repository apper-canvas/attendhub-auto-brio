class SessionsService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = "session_c"
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "participant_ids_c" } }
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
        console.error("Error fetching sessions:", error?.response?.data?.message)
      } else {
        console.error("Error fetching sessions:", error.message)
      }
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "participant_ids_c" } }
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
        console.error(`Error fetching session with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error("Error fetching session:", error.message)
      }
      return null
    }
  }

  async create(sessionData) {
    try {
      // Format participant IDs properly
      let participantIds = sessionData.participant_ids_c || sessionData.participantIds || []
      if (Array.isArray(participantIds)) {
        participantIds = participantIds.join(',')
      }

      const params = {
        records: [{
          Name: sessionData.Name || sessionData.name,
          date_c: sessionData.date_c || sessionData.date,
          type_c: sessionData.type_c || sessionData.type,
          participant_ids_c: participantIds
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
          console.error(`Failed to create sessions ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
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
        console.error("Error creating session:", error?.response?.data?.message)
      } else {
        console.error("Error creating session:", error.message)
      }
      throw error
    }
  }

  async update(id, sessionData) {
    try {
      // Format participant IDs properly
      let participantIds = sessionData.participant_ids_c || sessionData.participantIds
      if (Array.isArray(participantIds)) {
        participantIds = participantIds.join(',')
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: sessionData.Name || sessionData.name,
          date_c: sessionData.date_c || sessionData.date,
          type_c: sessionData.type_c || sessionData.type,
          participant_ids_c: participantIds
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
          console.error(`Failed to update sessions ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
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
        console.error("Error updating session:", error?.response?.data?.message)
      } else {
        console.error("Error updating session:", error.message)
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
          console.error(`Failed to delete sessions ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting session:", error?.response?.data?.message)
      } else {
        console.error("Error deleting session:", error.message)
      }
      throw error
    }
  }
}

export const sessionsService = new SessionsService()