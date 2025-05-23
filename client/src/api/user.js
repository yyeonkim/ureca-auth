import fetchData from "@/api/config.js";

export async function signup(body) {
  return await fetchData("/signup", { body, method: "POST" });
}

export async function login(body) {
  return await fetchData("/login", { body, method: "POST" });
}

export async function getUser() {
  return await fetchData("/protected/users/me", null, false);
}

export async function logout() {
  return await fetchData("/logout");
}
