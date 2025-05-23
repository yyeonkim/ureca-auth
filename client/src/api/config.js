const PORT = 3000;

const BASE_URL =
  import.meta.env.MODE === "production"
    ? `${window.location.protocol}//${window.location.host}`
    : `${window.location.protocol}//${window.location.hostname}:${PORT}`;

const defaultOption = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

const isJson = (res) => {
  return res.headers.get("Content-Type").startsWith("application/json");
};

export default async function fetchData(path = "", option = {}, shouldHandleAuthError = true) {
  try {
    const query = option?.params
      ? Object.entries(option.params)
          .map(([key, value]) => `${key}=${value}`)
          .join("&")
      : null;

    const res = await fetch(`${BASE_URL}/api${path}${query ? `?${query}` : ""}`, {
      ...defaultOption,
      ...option,
      ...(option?.body ? { body: JSON.stringify(option.body) } : {}),
    });

    if (!res.ok) throw res;

    return isJson(res) ? await res.json() : await res.text();
  } catch (error) {
    if (shouldHandleAuthError && error.status === 401) {
      alert("로그인이 만료되었습니다.\n로그인 후 다시 시도해주세요.");
    } else {
      console.error(error);
    }

    throw error;
  }
}
