import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// Public pages: menu bar on top, footer on the bottom. The admin side and
// login page have their own layouts and never show these links.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
