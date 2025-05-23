import Header from "@/components/layout/Header.jsx";
import styles from "@/styles/Layout.module.css";
import { Outlet } from "react-router";

function Layout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
