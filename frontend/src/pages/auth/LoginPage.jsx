import { useState }      from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }       from "@/hooks/useAuth";
import { useToast }      from "@/hooks/useToast";
import { ROUTES }        from "@/constants/routes.constants";
import Input             from "@/components/ui/Input";
import Button            from "@/components/ui/Button";
import PageTitle         from "@/components/common/PageTitle";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // const submit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await login(form);
  //     toast.success("Welcome back!");
  //     navigate(ROUTES.HOME);
  //   } catch (err) { toast.error(err?.payload ?? "Login failed"); }
  // };
  const submit = async (e) => {
  e.preventDefault();

  try {
    await login(form);
    toast.success("Welcome back!");
    navigate(ROUTES.HOME);
  } catch (err) {
    toast.error(err || "Login failed");
  }
};

  return (
    <>
      <PageTitle title="Login" />
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Mobile Number" name="mobile" type="tel" maxLength={10} value={form.mobile} onChange={handle} required placeholder="9876543210" />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500">Don't have an account? <Link to={ROUTES.REGISTER} className="text-primary hover:underline">Register</Link></p>
      </div>
    </>
  );
};
export default LoginPage;
