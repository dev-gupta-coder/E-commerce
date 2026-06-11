import { useEffect } from "react";
import { APP_NAME } from "@/constants/app.constants";
const PageTitle = ({ title }) => { useEffect(() => { document.title = title ? `${title} | ${APP_NAME}` : APP_NAME; }, [title]); return null; };
export default PageTitle;
