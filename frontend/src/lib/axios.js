import axios from 'axios'
const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";


export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true // send cookies with the request
})