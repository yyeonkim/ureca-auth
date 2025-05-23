import Layout from "@/components/layout/Layout.jsx";
import Home from "@/routers/Home.jsx";
import LoginPage from "@/routers/LoginPage.jsx";
import SignUpPage from "@/routers/SignUpPage.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        Component: Home,
        path: "/",
      },
      {
        Component: LoginPage,
        path: "/login",
      },
      {
        Component: SignUpPage,
        path: "/signup",
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
