import { useState } from "react";
import Input  from "@/components/ui/Input";
import Button from "@/components/ui/Button";
const AddressForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({ street: "", city: "", state: "", pincode: "", country: "India" });
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <Input label="Street" name="street" value={form.street} onChange={handle} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City"  name="city"  value={form.city}  onChange={handle} required />
        <Input label="State" name="state" value={form.state} onChange={handle} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Pincode" name="pincode" value={form.pincode} onChange={handle} maxLength={6} required />
        <Input label="Country" name="country" value={form.country} onChange={handle} required />
      </div>
      <Button type="submit" className="w-full" loading={loading}>Continue to Payment</Button>
    </form>
  );
};
export default AddressForm;
