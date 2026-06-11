import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../features/address/addressSlice";

const AddressPage = () => {
  const dispatch = useDispatch();

  const {
    addresses,
    selectedAddress,
    loading,
  } = useSelector((state) => state.address);

  const [editingAddress, setEditingAddress] =
    useState(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editingAddress) {
        await dispatch(
          updateAddress({
            addressId: editingAddress._id,
            payload: data,
          })
        ).unwrap();

        toast.success("Address updated");
      } else {
        await dispatch(
          addAddress(data)
        ).unwrap();

        toast.success("Address added");
      }

      dispatch(fetchAddresses());

      setEditingAddress(null);

      reset();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);

    reset(address);
  };

  const handleDelete = async (addressId) => {
    try {
      await dispatch(
        deleteAddress(addressId)
      ).unwrap();

      toast.success("Address deleted");

      dispatch(fetchAddresses());
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSetDefault = (addressId) => {
    dispatch(setDefaultAddress(addressId));

    toast.success("Default address selected");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold dark:text-white">
          Manage Addresses
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-semibold dark:text-white">
              {editingAddress
                ? "Edit Address"
                : "Add Address"}
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <input
                {...register("fullName")}
                placeholder="Full Name"
                className="w-full rounded-lg border p-3"
              />

              <input
                {...register("mobile")}
                placeholder="Mobile Number"
                className="w-full rounded-lg border p-3"
              />

              <textarea
                {...register("addressLine")}
                placeholder="Address"
                className="w-full rounded-lg border p-3"
                rows="3"
              />

              <input
                {...register("city")}
                placeholder="City"
                className="w-full rounded-lg border p-3"
              />

              <input
                {...register("state")}
                placeholder="State"
                className="w-full rounded-lg border p-3"
              />

              <input
                {...register("pincode")}
                placeholder="Pincode"
                className="w-full rounded-lg border p-3"
              />

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-3 text-white"
              >
                {editingAddress
                  ? "Update Address"
                  : "Add Address"}
              </button>
            </form>
          </div>

          <div>
            <h2 className="mb-6 text-xl font-semibold dark:text-white">
              Saved Addresses
            </h2>

            {loading ? (
              <div className="rounded-xl bg-white p-6 shadow">
                Loading...
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`rounded-xl bg-white p-5 shadow dark:bg-gray-800 ${
                      selectedAddress?._id ===
                      address._id
                        ? "ring-2 ring-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold dark:text-white">
                          {address.fullName}
                        </h3>

                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                          {address.addressLine}
                        </p>

                        <p className="text-gray-600 dark:text-gray-300">
                          {address.city},{" "}
                          {address.state}
                        </p>

                        <p className="text-gray-600 dark:text-gray-300">
                          {address.pincode}
                        </p>

                        <p className="text-gray-600 dark:text-gray-300">
                          {address.mobile}
                        </p>

                        {address.isDefault && (
                          <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleSetDefault(
                            address._id
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                      >
                        Set Default
                      </button>

                      <button
                        onClick={() =>
                          handleEdit(address)
                        }
                        className="rounded-lg bg-yellow-500 px-4 py-2 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            address._id
                          )
                        }
                        className="rounded-lg bg-red-500 px-4 py-2 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;