import { Suspense } from "react";
import Header from "../Header";
import Footer from "../Footer";

type LayoutProps = {
    hideFooter?: boolean;
    children: React.ReactNode;
};

const Layout = ({ hideFooter, children }: LayoutProps) => (
    <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
        <Suspense fallback={<div className="fixed top-0 left-0 z-50 w-full h-[4.75rem] lg:h-[5.25rem] bg-n-8/90 backdrop-blur-sm border-b border-n-6"></div>}>
            <Header />
        </Suspense>
        {children}
        {hideFooter ? null : <Footer />}
    </div>
);

export default Layout;
