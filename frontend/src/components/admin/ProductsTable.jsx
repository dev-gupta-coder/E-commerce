import { Link }            from "react-router-dom";
import { ROUTES }          from "@/constants/routes.constants";
import { formatPrice }     from "@/utils/formatPrice";
import { useState }        from "react";
import ConfirmDialog       from "@/components/common/ConfirmDialog";
import { useDispatch }     from "react-redux";
import { deleteProductThunk } from "@/features/products/productThunks";
import { useToast }        from "@/hooks/useToast";

const ProductsTable = ({ products = [] }) => {
  const dispatch   = useDispatch();
  const toast      = useToast();
  const [delId, setDelId] = useState(null);

  const handleDelete = async () => {
    try { await dispatch(deleteProductThunk(delId)).unwrap(); toast.success("Product deleted."); }
    catch (err) { toast.error(err ?? "Delete failed."); }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Stock</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url ?? "/placeholder.png"} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    <span className="font-medium line-clamp-1 max-w-[180px]">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-500">{p.category}</td>
                <td className="py-3 font-semibold">{formatPrice(p.discountPrice ?? p.price)}</td>
                <td className="py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.stock > 0 ? p.stock : "Out of stock"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-3">
                    <Link to={ROUTES.ADMIN_PRODUCT_EDIT.replace(":id", p._id)} className="text-primary text-xs hover:underline">Edit</Link>
                    <button onClick={() => setDelId(p._id)} className="text-red-500 text-xs hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center text-gray-400 py-10">No products found.</p>}
      </div>
      <ConfirmDialog open={Boolean(delId)} onClose={() => setDelId(null)} onConfirm={handleDelete} title="Delete Product" message="This will soft-delete the product. Continue?" />
    </>
  );
};
export default ProductsTable;
