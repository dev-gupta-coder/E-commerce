import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser } from "../../features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const result = await dispatch(registerUser(formData)).unwrap();

      toast.success(result?.message || "Registration successful");

      navigate("/login");
    } catch (errorMessage) {
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Register
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Name"
              className="w-full rounded-lg border px-4 py-3 dark:bg-gray-700 dark:text-white"
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Mobile Number"
              className="w-full rounded-lg border px-4 py-3 dark:bg-gray-700 dark:text-white"
              {...register("mobileNumber", {
                required: "Mobile Number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Mobile Number must be exactly 10 digits",
                },
              })}
            />
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border px-4 py-3 dark:bg-gray-700 dark:text-white"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm dark:text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;