import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL", API_URL);

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true // send cookies with the request
})