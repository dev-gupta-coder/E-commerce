import axiosClient from "../../api/axiosClient";

export const getCartAPI = async () => {
  const { data } = await axiosClient.get("/cart");
  return data;
};

export const addCartItemAPI = async (payload) => {
  const { data } = await axiosClient.post(
    "/cart/items",
    payload
  );
  return data;
};

export const updateCartItemAPI = async ({
  itemId,
  quantity,
}) => {
  const { data } = await axiosClient.patch(
    `/cart/items/${itemId}`,
    { quantity }
  );

  return data;
};

export const removeCartItemAPI = async (itemId) => {
  const { data } = await axiosClient.delete(
    `/cart/items/${itemId}`
  );

  return data;
};

export const clearCartAPI = async () => {
  const { data } = await axiosClient.delete("/cart");
  return data;
};