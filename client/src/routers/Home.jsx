import { getUser } from "@/api/user.js";
import { useEffect, useState } from "react";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then((data) => setUser(data));
  }, []);

  return (
    <>
      <h1>Home</h1>
      {user && (
        <ul>
          {Object.entries(user).map(([k, v]) => (
            <li>
              {k}: {v}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Home;
