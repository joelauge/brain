import type { NextPage } from "next";
import LoginPage from "@/templates/LoginPage";

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description: "Login to access your BRAIN Media Consulting account",
};

const Login: NextPage = () => {
    return <LoginPage />;
};

export default Login;
