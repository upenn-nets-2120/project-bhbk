import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

export const chatApi = axios.create({
  baseURL: `${BASE_URL}/chat`,
  withCredentials: true
})

export const fetcher = (url: string) => api.get(url).then((res) => res.data);