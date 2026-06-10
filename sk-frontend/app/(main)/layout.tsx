'use client'
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import LoginPopout from "@/components/login_popup";
import { useUserContext } from "@/contextProvider";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const {user}=useUserContext()
  return (
<div>
        {/* ── Top Navbar (full width) ── */}
         <header className="sticky top-0 z-50 w-full">
          <Navbar />
        </header>

        {/* ── Below navbar: sidebar + page content side by side ── */}
        <div className="md:flex-row flex-col flex max-w-[2000] mx-auto  w-full ">

          {/* Main content (takes remaining width) */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            {children}
            {!user.isAuthenticated&&
            <LoginPopout/>}
          </main>
        </div>
          <Footer/>
    </div>
  );
}
