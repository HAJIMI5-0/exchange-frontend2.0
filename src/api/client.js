import axios from "axios";

console.log("API BASE:", import.meta.env.VITE_API_BASE_URL);

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

if (
  token &&
  !config.url.includes("/api/comments")
) {
  config.headers.Authorization = `Bearer ${token}`;
}

  return config;
});

export default client;