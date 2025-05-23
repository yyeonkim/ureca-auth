import styles from "@/styles/Header.module.css";
import { Link } from "react-router";

function Header() {
  return (
    <header className={styles.header}>
      <Link to="login">로그인</Link>
      <Link to="signup">회원가입</Link>
    </header>
  );
}

export default Header;
