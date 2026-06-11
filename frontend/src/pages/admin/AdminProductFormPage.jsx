import { useEffect }    from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate }   from "react-router-dom";
import { createProductThunk, updateProductThunk, fetchProductByIdThunk } from "@/features/products/productThunks";
import { selectProduct, selectProductsLoading } from "@/features/products/productSelectors";
import ProductForm      from "@/components/admin/ProductForm";
import PageTitle        from "@/components/common/PageTitle";
import { ROUTES }       from "@/constants/routes.constants";
import { useToast }     from "@/hooks/useToast";

const AdminProductFormPage = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const toast      = useToast();
  const product    = useSelector(selectProduct);
  const loading    = useSelector(selectProductsLoading);
  const isEdit     = Boolean(id);

  useEffect(() => { if (isEdit) dispatch(fetchProductByIdThunk(id)); }, [dispatch, id, isEdit]);

  const handleSubmit = async (form) => {
    try {
      if (isEdit) { await dispatch(updateProductThunk({ id, data: form })).unwrap(); toast.success("Product updated."); }
      else        { await dispatch(createProductThunk(form)).unwrap(); toast.success("Product created."); }
      navigate(ROUTES.ADMIN_PRODUCTS);
    } catch (err) { toast.error(err ?? "Save failed."); }
  };

  return (
    <>
      <PageTitle title={isEdit ? "Edit Product" : "Add Product"} />
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? "Edit Product" : "Add New Product"}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <ProductForm initial={isEdit && product ? { name: product.name, description: product.description, category: product.category, brand: product.brand, price: product.price, discountPrice: product.discountPrice ?? "", stock: product.stock } : undefined} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </>
  );
};
export default AdminProductFormPage;
