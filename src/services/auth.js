export function getCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const name = decoded.name || decoded.username || decoded.userName;
    const email = decoded.email;

    return {
      name: typeof name === "string" && name.trim() ? name.trim() : "Your profile",
      email: typeof email === "string" ? email : "",
    };
  } catch {
    return null;
  }
}
