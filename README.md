# 🔐 인증/인가

공부하며 끄적여 봅니다..

<details>
<summary>목차</summary>

- [보안 공격](#보안-공격)
  - [XSS(크로스 사이트 스크립팅)](#xss크로스-사이트-스크립팅-cross-site-scripting)
  - [CSRF(Cross-Site Request Forgery)](#csrfcross-site-request-forgery-사이트-간-요청-위조)
- [토큰 관리하기 - 저장소](#토큰-관리하기---저장소)
  - [요약 비교 표](#-요약-비교-표)
  - [브라우저 인증/인가는 쿠키를 사용하자](#브라우저-인증인가는-쿠키를-사용하자)
  - [쿠키를 사용할 수 없으면](#쿠키를-사용할-수-없으면)
- [토큰 관리하기 - 토큰 생성](#토큰-관리하기---토큰-생성)
  - [단일 서버에서는 세션 기반 인증](#단일-서버에서는-세션-기반-인증)
  - [다중 서버에서는 상황에 따라 선택](#다중-서버에서는-상황에-따라-선택)
- [JWT (JSON Web Token)](#jwt-json-web-token)
  - [HMAC SHA256](#-hmac-sha256)
  - [RSA SHA256](#-rsa-sha256)
- [JWT 실습](#jwt-실습)
  - [HMAC SHA256 방법](#hmac-sha256-방법)
  - [RSA SHA256 방법](#rsa-sha256-방법)
  - [accessToken, refreshToken으로 로그인 자동 연장하기](#accesstoken-refreshtoken으로-로그인-자동-연장하기)
- [Session ID 인증/인가](#session-id-인증인가)
- [배포 환경에서도 쿠키가 잘 될까?](#배포-환경에서도-쿠키가-잘-될까)
</details>

## 보안 공격

### XSS(크로스 사이트 스크립팅, Cross-Site Scripting)

**스크립트 삽입**하여 해커가 원하는 동작을 브라우저에서 수행한다.

#### ✅ XSS 공격의 주된 목적

어떤 스크립트를 삽입하냐에 따라 목적은 다양해진다.

| 목적                                     | 설명                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **1. 세션 쿠키 탈취**                    | 사용자의 로그인 세션 쿠키를 탈취해 **인증된 사용자로 가장**                                      |
| **2. 계정 탈취**                         | 자동 로그인 상태를 이용해 **사용자 계정에 접근**                                                 |
| **3. 피싱 사이트로 유도**                | DOM 조작으로 가짜 로그인 창을 띄워 **비밀번호 입력 유도**                                        |
| **4. 악성 스크립트 실행**                | 웹페이지에서 **브라우저 권한 내에서 마음대로 실행** (예: keylogging, 브라우저 내 저장소 접근 등) |
| **5. 내부 정보 수집**                    | 사용자가 보고 있는 정보나 내부 페이지의 데이터 수집                                              |
| **6. 브라우저 측 요청 조작 (csrf 보완)** | 피해자 브라우저에서 특정 API를 호출하여 서버에 요청을 보냄                                       |

### CSRF(Cross-Site Request Forgery, 사이트 간 요청 위조)

로그인하여 토큰을 가지고 있는 사용자가 해커 사이트에 접속하면, 사용자 토큰을 도용하여 서버에 **악의적인 요청**을 보내는 것

#### 📌 예시 시나리오:

1. 사용자가 은행 웹사이트에 로그인하여 **세션 쿠키를 가진 상태**입니다.
2. 공격자가 만든 악성 웹사이트에 접속합니다.
3. 해당 사이트는 사용자의 **세션 쿠키를 자동으로 사용하는 요청**(예: 송금, 비밀번호 변경 등)을 피해자가 모르게 은행 서버에 전송합니다.
4. 서버는 사용자의 세션을 기반으로 요청을 신뢰하고 **정상적인 요청으로 처리**합니다.

#### 🎯 CSRF로 가능한 악의적 행위 예시

| 예시          | 설명                                               |
| ------------- | -------------------------------------------------- |
| 송금 요청     | 사용자의 계좌에서 공격자의 계좌로 송금             |
| 비밀번호 변경 | 사용자 계정의 비밀번호를 공격자가 아는 값으로 변경 |
| 게시물 작성   | 피해자 계정으로 공격자 글을 게시                   |
| 계정 삭제     | 사용자의 계정을 삭제 요청                          |

➡️ 한 마디로 **`계정 도용`**

# 토큰 관리하기 - 저장소

인증/인가에 사용되는 토큰은 어떻게 관리하는 게 좋을까?

## ✅ 요약 비교 표

| 저장소 종류             | 위치     | 보안성 🔒 | XSS 취약성              | CSRF 취약성                   | 자동 전송     | 주로 저장하는 키            | 사용 추천 상황                           |
| ----------------------- | -------- | --------- | ----------------------- | ----------------------------- | ------------- | --------------------------- | ---------------------------------------- |
| 1. **쿠키**             | 브라우저 | 중간~높음 | 낮음 (HttpOnly 설정 시) | **높음 (sameSite 설정 필요)** | O (자동 전송) | 세션 ID, JWT                | 서버 세션 기반 인증, 자동 인증 필요할 때 |
| 2. **로컬 스토리지**    | 브라우저 | 낮음      | **높음**                | 낮음                          | X             | JWT                         | 단순한 클라이언트 인증, SPA 앱 등        |
| 3. **세션 스토리지**    | 브라우저 | 낮음      | **높음**                | 낮음                          | X             | JWT                         | 로그인 유지가 탭 단위일 때 적합          |
| 4. **서버 세션 저장소** | 서버     | 높음      | 없음                    | 없음                          | 서버 관리     | 세션 ID 매핑된 데이터       | 민감 정보, 인증 상태 저장                |
| 5. **DB (DBMS)**        | 서버     | **높음**  | 없음                    | 없음                          | 서버 관리     | 유저 정보, 리프레시 토큰 등 | 장기 저장, 로그, 상태 관리 등            |

## 브라우저 인증/인가는 쿠키🍪를 사용하자

**이유**:

1. 서버에서 쿠키 설정을 제어할 수 있다.
   1. 브라우저가 조금이라도 관여하지 못하게 하자.
2. 쿠키 `HttpOnly: true`이면 XSS 공격으로 쿠키를 읽지 못하게 막을 수 있다.
3. `Secure: true`로 설정하여 https 프로토콜을 사용하지 않는 사이트에서는 쿠키가 전송되지 않도록 한다.
   1. http를 사용하는 해커 사이트가 쿠키를 도용할 수 없다.
   2. https를 사용하는 해커 사이트라도 https에서는 쿠키가 암호화되어 쿠키에 적힌 정보는 읽을 수 없다.
4. `SameSite: strict 또는 lax`로 설정하여 동일한 도메인에서만 쿠키가 자동 전송되도록 한다.
   1. 해커의 외부 사이트가 서버에 요청해도 쿠키가 전송되지 않는다.

**한계**:

1. 크로스 도메인으로 흔히 FE와 BE의 도메인이 다르면 `SameSite: None`으로 설정해야 한다.
   1. 그러면 외부 사이트에도 쿠키가 전송되겠지만 `Secure: true`를 사용하여 암호화라도 하자.
   2. cors로 API 호출할 origin도 제한하면 쿠키를 도용한 해커 사이트가 악의적인 요청은 할 수 없다.
   3. 혹시나 쿠키가 노출될 경우를 대비해 중요한 정보는 저장하지 않는다.
2. 쿠키는 매 요청에 자동 전송되기 때문에 요청/응답 데이터 크기가 커진다.
3. 쿠키는 다른 저장소에 비해 용량이 작다. 많은 정보를 저장할 순 없다.

## 쿠키를 사용할 수 없으면❓

### 1. **모바일 앱 (iOS/Android) 클라이언트**

- 모바일 앱은 브라우저가 아니기 때문에, **자동 쿠키 관리가 불가능**합니다.
- API 요청마다 **명시적으로 토큰을 헤더에 담아야** 합니다.
- 이 경우 보통 **JWT를 Authorization 헤더에 실어 관리**합니다.
  ```jsx
  Authorization: Bearer <token>
  ```

### 2. **서버 간 통신 (서버 → 인증 API 요청)**

- 서버 간 HTTP 요청은 쿠키를 자동 전송하지 않음.
- 따라서 **JWT나 Access Token**을 직접 `Authorization` 헤더로 전달하는 방식이 일반적입니다.

### 3. **Strict CSP(콘텐츠 보안 정책)나 프레임 내 요청 제한 환경**

- 보안 정책 상 **3rd-party 쿠키를 차단**하는 경우 (예: 브라우저 설정, 조직 정책 등)
- `iframe` 안에서의 요청, 광고 추적 방지 정책 등에서 **쿠키 전송이 막히는** 경우도 있음

### 4. **쿠키 저장이 금지된 환경 (예: 브라우저 설정 또는 사용자 설정)**

- 사용자가 **브라우저 설정으로 쿠키 저장을 차단**해 둔 경우
- 일부 브라우저의 **시크릿 모드**에서 제한된 쿠키 동작이 발생할 수 있음

# 토큰 관리하기 - 토큰 생성

JWT와 Session ID는 각각 언제 사용하면 좋을까?

## 단일 서버에서는 세션 기반 인증

중앙 집중 시스템(or 단일 서버)에 **보안**이 중요하다면 **세션**을 사용하자.

- 단일 서버만 사용해도 될 정도로 간단한 서비스거나 서버 하나로 모든 처리를 하는 시스템일 때
- 브라우저로 전송되는 세션 ID는 사용자 관련 정보를 담고 있지 않다. (정말 그냥 하나의 ID임)
- 해당 세션 ID에 해당하는 정보가 무엇이 있는지는 서버만 본인의 메모리에서 확인 가능
- 서버에서 바로 세션 무효화 가능

**구현 방법**:

- 세션 ID 유효 시간은 되도록 짧게 20~30분으로 설정
- 클라이언트는 특정 API를 호출하여 자신이 로그인 상태인지 새로고침 할 때마다 확인
- 사용자가 특정 버튼을 클릭하거나 사용자의 마지막 요청으로부터 세션 유효 기간을 갱신하는 방법으로 사용자 편의성을 늘릴 수 있다.

## 다중 서버에서는 상황에 따라 선택

### 세션 기반 인증

세션 기반 인증도 세션 저장소를 서버가 공유하여 다중 서버에서도 사용할 수 있다.

**특징**:

1. 세션 저장소를 따로 설정하여 서버끼리 동일한 세션 ID를 공유한다. (서버 자원 사용)

2. 세션 저장소만으로는 모든 정보를 알 순 없다. 추가로 필요한 데이터를 조회하려면 저장소에서 확인한 세션 정보로 DB를 조회해야 한다.

   - 세션 저장소에 필요한 데이터를 모두 저장하면 되지 않나❓
     > 휘발성 메모리가 아닌 Redis, Mongo Store 같은 외부 저장소를 사용한다면 가능하다.
     > 하지만, 세션 만료 시 함께 사라지며 DB 데이터와 동기화가 별도로 필요하다.

3. 세션은 브라우저의 쿠키를 기반으로 하기 때문에 그 외 모바일이나 다른 시스템과 연동이 어렵다.

### JWT

**특징**:

1. 저장소가 따로 필요 없다. DB만 한 번 조회하여 사용자 정보를 가져온다. (서버 자원 감소)
2. 브라우저가 아닌(쿠키가 없는) 서버나 모바일에서 인증이 필요하다면 JWT와 헤더에 Authorization을 설정하는 방법으로 구현할 수 있다.
3. 암호화되지 않은 정보로 누구나 디코딩(복호화 X)이 가능하다. → 중요한 정보 담으면 안됨
4. 사용자 정보가 1도 없는 세션ID 보다는 아무래도 보안 이슈가 있다. 특히 refreshToken처럼 DB에 추가로 토큰을 저장한다면 잘 관리해야 한다.
5. 세션ID보다 데이터 크기가 크다.

# JWT (JSON Web Token)

코드 출처: https://github.com/auth0/node-jsonwebtoken#readme

**Synchronous Sign with default (HMAC SHA256)**

```jsx
var jwt = require("jsonwebtoken");
var token = jwt.sign({ foo: "bar" }, "shhhhh");
```

**Synchronous Sign with RSA SHA256**

```jsx
// sign with RSA SHA256
var privateKey = fs.readFileSync('private.key');
var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' });`
```

## **🔧 HMAC SHA256**

> 키를 하나면 사용하며, 해당 키로 토큰 생성과 검증을 수행

### **언제 사용하나요?**

1. **성능이 중요한 경우**
   - RS256보다 HS256이 처리 속도가 더 빠름
   - 대량의 토큰을 처리해야 하는 경우
2. **단순한 구현이 필요한 경우**
   - 키 관리가 더 단순함 (하나의 secret key만 관리)
   - 구현 복잡도가 낮음

### 단점

1. **보안 취약점**
   - 단일 secret key를 사용하므로 키가 노출되면 모든 토큰이 위험
   - 키를 여러 서비스와 공유해야 하는 경우 보안 위험 증가
2. **키 관리의 어려움**
   - 키 순환이 어려움 (모든 서비스에 동시에 배포 필요)
   - 키 노출 시 모든 서비스에 영향을 미침
3. **마이크로서비스 환경에서의 제한**
   - 여러 서비스가 토큰을 검증해야 하는 경우 적합하지 않음
   - 서비스 간 키 공유로 인한 보안 위험

## **🛠️ RSA SHA256**

> private key와 public key 두 개를 사용한다. 토큰 서명(생성)에는 private key를, 토큰 검증에는 public key를 사용한다.
> private key는 서버에만 보관하고, public key는 클라이언트나 다른 서비스에 공유할 수 있다.

- 참고: https://www.geeksforgeeks.org/rsa-algorithm-cryptography/

### **언제 사용하나요?**

1. **보안이 중요한 경우**
   - 클라이언트는 public key만으로 검증 가능, 서버는 private key로만 토큰 생성 가능
   - 중간자 공격으로 public key가 탈취되어도 검증만 가능하지 토큰 생성은 불가능
   - 사례: 금융 서비스, 의료 정보 시스템, 기업 내부 시스템
2. **확장성이 필요한 경우**

   - key를 업데이트 하면 모든 서버와 이를 공유해야 하고, 이는 키 노출 위험을 증가시킨다.
   - private key는 한 서버에서 관리하여 토큰을 생성하고,
   - 다른 서버나 서비스는 public key만 공유 받아 토큰 검증만 수행할 수 있다.

   > 💡  
   > 키를 두 개 사용하여 키를 관리하는 관점에서 HMAC보다 **RSA**이 다중 서버에서 보안이 더 우수하다는 말.  
   > **HMAC**도 당연히 다중 서버 환경에서 사용할 수 있다.

# JWT 실습

## **HMAC SHA256 방법**

1. 요청 쿠키를 읽기 위해 cooke-parser 미들웨어 설치

   ```jsx
   // index.js
   const cookieParser = require("cookie-parser");
   app.use(cookieParser());
   ```

2. 회원가입/로그인/로그아웃 컨트롤러

   ```jsx
   // userController.js
   const bcrypt = require("bcrypt");
   const User = require("@/models/User.js");
   const jwt = require("jsonwebtoken");

   // ...

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
         sameSite: "lax",
         domain: process.env.NODE_ENV === "production" ? "{your.domain}" : "localhost",
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

   async function logout(req, res) {
     try {
       res.clearCookie("tkn");
       return res.sendStatus(200);
     } catch (error) {
       console.error(error);
       return res.sendStatus(500);
     }
   }

   module.exports = { signup, login, getUser, logout };
   ```

## **RSA SHA256 방법**

`.pem` 형식의 private key, public key를 생성하여 토큰 생성/검증에 사용한다.

- Window 다운로드: https://github.com/openssl/openssl/blob/master/NOTES-WINDOWS.md

## accessToken, refreshToken으로 로그인 자동 연장하기

(작성 중..)

# Session ID 인증/인가

1. `express-session` 미들웨어 설치

(작성 중..)

# 배포 환경에서도 쿠키가 잘 될까?

**참고**: [onrender.com](http://onrender.com/)처럼 여러 곳에서 사용되는 도메인은 **쿠키 전송을 제한**하기도 함 (삽질 주의, 아래 이슈 참고)

- https://community.render.com/t/setting-cookies-onrender-com/7886/3
- https://community.render.com/t/sended-cookie-is-not-getting-set-on-frontend/15007

Render로 배포하고 쿠키도 사용하고 싶다

➡️ **커스텀 도메인**을 설정해보자.

```jsx
res.cookie("tkn", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  domain: process.env.NODE_ENV === "production" ? "{my-custom-domain}" : "localhost",
  sameSite: "lax",
  maxAge: 20 * 60 * 1000, // 20분
});
```

결과: 잘 된다 드디어 😭😭😭

| 서버에서 쿠키 전송                     | 브라우저에 생성된 쿠키                   |
| -------------------------------------- | ---------------------------------------- |
| ![Network Response](/docs/result1.png) | ![Application Cookie](/docs/result2.png) |
