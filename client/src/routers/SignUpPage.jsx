import { signup } from "@/api/user.js";

function SignUpPage() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const nickname = e.target[1].value;
    const password = e.target[2].value;

    await signup({ username, nickname, password });
  };

  return (
    <>
      <h1>회원가입</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="아이디" />
        <input type="text" placeholder="닉네임" />
        <input type="password" placeholder="비밀번호" />
        <button>가입하기</button>
      </form>
    </>
  );
}

export default SignUpPage;
