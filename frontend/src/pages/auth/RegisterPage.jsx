import { useState }      from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch }   from "react-redux";
import { registerThunk } from "@/features/auth/authThunks";
import { useToast }      from "@/hooks/useToast";
import { ROUTES }        from "@/constants/routes.constants";
import Input             from "@/components/ui/Input";
import Button            from "@/components/ui/Button";
import PageTitle         from "@/components/common/PageTitle";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const toast    = useToast();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(registerThunk(form)).unwrap();
      toast.success("Account created! Please log in.");
      navigate(ROUTES.LOGIN);
    } catch (err) { toast.error(err ?? "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageTitle title="Register" />
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join us today</p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full Name"      name="name"     value={form.name}     onChange={handle} required placeholder="John Doe" />
          <Input label="Mobile Number"  name="mobile"   type="tel" maxLength={10} value={form.mobile}    onChange={handle} required placeholder="9876543210" />
          <Input label="Password"       name="password" type="password" value={form.password} onChange={handle} required placeholder="Min 8 characters" />
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500">Already have an account? <Link to={ROUTES.LOGIN} className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </>
  );
};
export default RegisterPage;
