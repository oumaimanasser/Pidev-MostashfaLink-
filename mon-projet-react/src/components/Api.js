// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/hospitalized-patients';

export const fetchPatients = () => axios.get(API_URL);
export const addPatient = (patient) => axios.post(API_URL, patient);
export const updatePatient = (id, patient) => axios.put(`${API_URL}/${id}`, patient);
export const deletePatient = (id) => axios.delete(`${API_URL}/${id}`);

// Utilisation dans le composant :
import { fetchPatients, addPatient, updatePatient, deletePatient } from './api';

// Remplacer les appels axios directs par :
const response = await fetchPatients();
await addPatient(newPatient);
await updatePatient(selectedPatient._id, selectedPatient);
await deletePatient(id);