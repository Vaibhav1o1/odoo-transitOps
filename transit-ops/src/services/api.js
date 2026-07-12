// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const vehicleAPI = {
  getAll: (status) => api.get('/vehicles', { params: { status } }),
  // Payload keys match your schema perfectly
  create: (vehicleData) => api.post('/vehicles', {
    reg_number: vehicleData.reg_number,
    name_model: vehicleData.name_model,
    type: vehicleData.type,
    max_capacity_kg: parseFloat(vehicleData.max_capacity_kg),
    acquisition_cost: parseFloat(vehicleData.acquisition_cost),
    odometer: parseFloat(vehicleData.odometer || 0)
  }),
};

export const tripAPI = {
  dispatch: (tripId) => api.post('/trips/dispatch', { trip_id: tripId }),
};

export default api;