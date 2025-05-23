const bcrypt = require("bcrypt");
const User = require("@/models/User.js");
const jwt = require("jsonwebtoken");

async function signup(req, res) {
  const saltRounds = 10;

  const { username, password, nickname } = req.body;

  if (!username || !password || !nickname) {
    return res.sendStatus(400);
  }

  try {
    const data = await User.findOne({ username });

    if (data) {
      return res.status(409).json({
        message: "이미 존재하는 아이디입니다.",
      });
    }

    // 회원 생성
    await bcrypt.genSalt(saltRounds, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) throw err;
        // Store hash in your password DB.
        User.create({
          username,
          nickname,
          password: hash,
        });
      });
    });

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const data = await User.findOne({ username });

    if (!data) {
      return res.status(400).json({
        message: "존재하지 않는 회원입니다.",
      });
    }

    // 비밀번호 대조
    const isSame = await bcrypt.compare(password, data.password).then((result) => result);

    if (!isSame) {
      return res.status(400).json({
        message: "비밀번호가 일치하지 않습니다.",
      });
    }

    const token = jwt.sign({ user: data._id }, process.env.PRIVATE_KEY, { expiresIn: 20 * 60 }); // 유효 기간: 20분

    console.log("login >>", token);

    res.cookie("tkn", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? "nts-yyeon.pics" : "localhost",
      sameSite: "lax",
      maxAge: 20 * 60 * 1000, // 20분
    });

    return res.status(200).json({
      nickname: data.nickname,
    });
  } catch (error) {
    console.error(error);
  }
}

async function getUser(req, res) {
  const token = req.cookies.tkn;

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    console.log("decoded >>", decoded);
    const data = await User.findById({ _id: decoded.user });

    return res.status(200).json({
      nickname: data.nickname,
      username: data.username,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") return res.sendStatus(401);
    return res.sendStatus(500);
  }
}

async function postSomething(req, res) {
  const token = req.cookies.tkn;

  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    console.log("decoded >>", decoded);

    return res.sendStatus(200);
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") return res.sendStatus(401);
    return res.sendStatus(500);
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("tkn");
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

module.exports = { signup, login, getUser, logout, postSomething };
