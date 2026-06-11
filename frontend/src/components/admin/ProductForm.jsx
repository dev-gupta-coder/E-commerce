import { useState }        from "react";
import Input               from "@/components/ui/Input";
import Button              from "@/components/ui/Button";
import ImageUpload         from "@/components/common/ImageUpload";
import { PRODUCT_CATEGORIES } from "@/constants/app.constants";

const EMPTY = { name: "", description: "", category: "", brand: "", price: "", discountPrice: "", stock: "" };

const ProductForm = ({ initial = EMPTY, onSubmit, loading }) => {
  const [form, setForm] = useState(initial);
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <Input label="Product Name" name="name" value={form.name} onChange={handle} required />
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={4} required className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="category" value={form.category} onChange={handle} required className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Select category</option>
            {(PRODUCT_CATEGORIES ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Input label="Brand" name="brand" value={form.brand} onChange={handle} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Price (paise)" name="price" type="number" value={form.price} onChange={handle} required min={0} />
        <Input label="Discount Price" name="discountPrice" type="number" value={form.discountPrice} onChange={handle} min={0} />
        <Input label="Stock" name="stock" type="number" value={form.stock} onChange={handle} required min={0} />
      </div>
      <ImageUpload multiple onUpload={(files) => setForm((f) => ({ ...f, files }))} />
      <Button type="submit" loading={loading} className="w-full">Save Product</Button>
    </form>
  );
};
export default ProductForm;
