import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const initialForm = {
  name: "",
  price: "",
  stock: "",
  description: "",
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] =
    useState(initialForm);
  const [editingId, setEditingId] =
    useState(null);

  const fetchProducts = async () => {
    try {
      const response =
        await axiosClient.get("/products");

      setProducts(
        response.data?.data?.products ||
          response.data?.products ||
          []
      );
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axiosClient.put(
          `/products/${editingId}`,
          formData
        );

        toast.success(
          "Product updated successfully"
        );
      } else {
        await axiosClient.post(
          "/products",
          formData
        );

        toast.success(
          "Product created successfully"
        );
      }

      setFormData(initialForm);
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description:
        product.description || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(
        `/products/${id}`
      );

      toast.success(
        "Product deleted successfully"
      );

      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <h1 className="mb-8 text-3xl font-bold dark:text-white">
        Product Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl bg-white p-6 shadow dark:bg-gray-800"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            placeholder="Price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: e.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <input
            placeholder="Stock"
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock: e.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value,
              })
            }
            className="rounded-lg border p-3"
          />
        </div>

        <button className="mt-4 rounded-lg bg-blue-600 px-6 py-3 text-white">
          {editingId
            ? "Update Product"
            : "Create Product"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow dark:bg-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">
                Name
              </th>
              <th className="p-4 text-left">
                Price
              </th>
              <th className="p-4 text-left">
                Stock
              </th>
              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b"
              >
                <td className="p-4">
                  {product.name}
                </td>

                <td className="p-4">
                  ₹{product.price}
                </td>

                <td className="p-4">
                  {product.stock}
                </td>

                <td className="p-4 space-x-2">
                  <button
                    onClick={() =>
                      handleEdit(product)
                    }
                    className="rounded bg-yellow-500 px-3 py-2 text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        product._id
                      )
                    }
                    className="rounded bg-red-500 px-3 py-2 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;