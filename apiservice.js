// api/services/cycleTrackingService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/cycles'; // Update with your API URL

export const cycleTrackingService = {
  // Fetch all cycle data for a user
  async getUserCycleData(userId) {
    try {
      const response = await axios.get(`${BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch cycle data: ' + error.message);
    }
  },

  // Add new cycle entry
  async addCycleEntry(userId, entryData) {
    try {
      const response = await axios.post(`${BASE_URL}/${userId}`, entryData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('An entry already exists for this date');
      }
      throw new Error('Failed to add cycle entry: ' + error.message);
    }
  },

  // Update existing cycle entry
  async updateCycleEntry(userId, entryId, entryData) {
    try {
      const response = await axios.put(
        `${BASE_URL}/${userId}/${entryId}`,
        entryData
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update cycle entry: ' + error.message);
    }
  },

  // Delete cycle entry
  async deleteCycleEntry(userId, entryId) {
    try {
      await axios.delete(`${BASE_URL}/${userId}/${entryId}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete cycle entry: ' + error.message);
    }
  },

  // Get cycle predictions
  async getCyclePredictions(userId) {
    try {
      const response = await axios.get(`${BASE_URL}/${userId}/predictions`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch cycle predictions: ' + error.message);
    }
  }
};