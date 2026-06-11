import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/services/order.service";

export const fetchMyOrdersThunk  = createAsyncThunk("orders/fetchMy",   async (params, { rejectWithValue }) => { try { return (await orderService.getMyOrders(params)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const fetchOrderByIdThunk = createAsyncThunk("orders/fetchOne",  async (id, { rejectWithValue }) => { try { return (await orderService.getById(id)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const createOrderThunk    = createAsyncThunk("orders/create",    async (data, { rejectWithValue }) => { try { return (await orderService.create(data)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const updateOrderStatusThunk = createAsyncThunk("orders/updateStatus", async ({ id, data }, { rejectWithValue }) => { try { return (await orderService.updateStatus(id, data)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const fetchAllOrdersThunk = createAsyncThunk("orders/fetchAll",  async (params, { rejectWithValue }) => { try { return (await orderService.getAll(params)).data.data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
