import axios from "axios";

export const httpRequest = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
});
