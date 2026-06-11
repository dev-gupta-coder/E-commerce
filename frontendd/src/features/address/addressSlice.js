import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAddressesAPI,
  createAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
} from "./addressAPI";

export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      return await getAddressesAPI();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch addresses"
      );
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/addAddress",
  async (payload, { rejectWithValue }) => {
    try {
      return await createAddressAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to add address"
      );
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async (payload, { rejectWithValue }) => {
    try {
      return await updateAddressAPI(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update address"
      );
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (addressId, { rejectWithValue }) => {
    try {
      await deleteAddressAPI(addressId);
      return addressId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete address"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    selectedAddress: null,
    loading: false,
    error: null,
  },
  reducers: {
    setDefaultAddress: (state, action) => {
      const addressId = action.payload;

      state.addresses = state.addresses.map(
        (address) => ({
          ...address,
          isDefault: address._id === addressId,
        })
      );

      state.selectedAddress =
        state.addresses.find(
          (address) => address._id === addressId
        ) || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;

        const addresses =
          action.payload?.data?.addresses ||
          action.payload?.addresses ||
          action.payload?.data ||
          [];

        state.addresses = addresses;

        state.selectedAddress =
          addresses.find(
            (address) => address.isDefault
          ) || addresses[0] || null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDefaultAddress } =
  addressSlice.actions;

export default addressSlice.reducer;