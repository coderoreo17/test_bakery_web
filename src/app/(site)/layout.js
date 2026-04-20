import Navbar from "@/components/Navbar";
import AuthEventToast from "@/components/AuthEventToast";

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <AuthEventToast />
      {children}
    </>
  );
}