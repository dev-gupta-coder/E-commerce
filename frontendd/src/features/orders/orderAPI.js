import axiosClient from "../../api/axiosClient";

export const getOrdersAPI = async () => {
  const { data } = await axiosClient.get("/orders");
  return data;
};

export const getOrderByIdAPI = async (orderId) => {
  const { data } = await axiosClient.get(`/orders/${orderId}`);
  return data;
};