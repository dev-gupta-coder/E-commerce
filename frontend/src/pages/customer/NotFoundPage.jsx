import { Link }   from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import Button     from "@/components/ui/Button";
import PageTitle  from "@/components/common/PageTitle";

const NotFoundPage = () => (
  <>
    <PageTitle title="404 Not Found" />
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <p className="text-8xl font-black text-gray-100 dark:text-gray-800">404</p>
      <h1 className="text-2xl font-bold -mt-8">Page Not Found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      <Button><Link to={ROUTES.HOME}>Go Home</Link></Button>
    </div>
  </>
);
export default NotFoundPage;
