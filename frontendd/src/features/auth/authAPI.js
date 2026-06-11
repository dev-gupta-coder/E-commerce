import axiosClient from "../../api/axiosClient";

export const registerAPI = async (payload) => {
  const { data } = await axiosClient.post("/auth/register", payload);
  return data;
};

export const loginAPI = async (payload) => {
  const { data } = await axiosClient.post("/auth/login", payload);
  return data;
};

export const logoutAPI = async () => {
  const { data } = await axiosClient.post("/auth/logout");
  return data;
};

export const getCurrentUserAPI = async () => {
  const { data } = await axiosClient.get("/auth/me");
  return data;
};