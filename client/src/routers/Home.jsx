import { getUser, postSomething } from "@/api/user.js";
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
      <button type="button" onClick={async () => await postSomething()}>
        POST 요청
      </button>
    </>
  );
}

export default Home;
