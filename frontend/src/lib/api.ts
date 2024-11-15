import axios from "axios";

export const BASE_URL = process.env.NODE_ENV === 'production' ? "http://100.25.138.192:8000" : "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

export const chatApi = axios.create({
  baseURL: `${BASE_URL}/chat`,
  withCredentials: true,
});

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const createWebSocketConnection = (chatId: number) => {
  const socket = new WebSocket(
    `ws://${BASE_URL.replace("http://", "").replace(
      "https://",
      ""
    )}/chat/${chatId}/message`
  );
  return socket;
};
