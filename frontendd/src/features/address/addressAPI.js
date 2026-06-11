import axiosClient from "../../api/axiosClient";

export const getAddressesAPI = async () => {
  const { data } = await axiosClient.get("/address");
  return data;
};

export const createAddressAPI = async (payload) => {
  const { data } = await axiosClient.post("/address", payload);
  return data;
};

export const updateAddressAPI = async ({
  addressId,
  payload,
}) => {
  const { data } = await axiosClient.put(
    `/address/${addressId}`,
    payload
  );

  return data;
};

export const deleteAddressAPI = async (addressId) => {
  const { data } = await axiosClient.delete(
    `/address/${addressId}`
  );

  return data;
};