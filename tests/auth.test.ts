import jwt from "jsonwebtoken";
import { api, cookiesOf, memberInput, signupMember } from "./helpers";

describe("signup", () => {
  it("creates a member and returns an access token", async () => {
    const input = memberInput();
    const res = await api().post("/member/signup").send(input);

    expect(res.status).toBe(201);
    expect(res.body.member.memberNick).toBe(input.memberNick);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(cookiesOf(res)).toMatch(/accessToken=/);
  });

  it("never returns the password hash", async () => {
    const { member } = await signupMember();
    expect(member.memberPassword ?? "").not.toMatch(/^\$2/);
  });

  it("rejects a phone number that is not 9-15 digits", async () => {
    const res = await api()
      .post("/member/signup")
      .send(memberInput({ memberPhone: "abc123" }));
    expect(res.status).toBe(400);
  });

  it("rejects a nick that is already taken", async () => {
    const { input } = await signupMember();
    const res = await api()
      .post("/member/signup")
      .send(memberInput({ memberNick: input.memberNick }));
    expect(res.status).toBe(400);
  });
});

describe("login", () => {
  it("logs in with the right password", async () => {
    const { input } = await signupMember();
    const res = await api().post("/member/login").send({
      memberNick: input.memberNick,
      memberPassword: input.memberPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.member.memberPassword).toBeUndefined();
  });

  it("rejects a wrong password with 401", async () => {
    const { input } = await signupMember();
    const res = await api()
      .post("/member/login")
      .send({ memberNick: input.memberNick, memberPassword: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("returns 404 for an unknown nick", async () => {
    const res = await api()
      .post("/member/login")
      .send({ memberNick: "nobody", memberPassword: "password123" });
    expect(res.status).toBe(404);
  });
});

describe("protected routes", () => {
  it("returns 401 without a token", async () => {
    const res = await api().get("/member/detail");
    expect(res.status).toBe(401);
  });

  it("returns 401 for a forged token", async () => {
    const forged = jwt.sign({ _id: "x", memberNick: "x" }, "not-the-secret");
    const res = await api()
      .get("/member/detail")
      .set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it("returns 401 for an expired token", async () => {
    const { member } = await signupMember();
    const expired = jwt.sign(member, process.env.SECRET_TOKEN as string, {
      expiresIn: -10,
    });
    const res = await api()
      .get("/member/detail")
      .set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it("accepts a valid Bearer token", async () => {
    const { auth, input } = await signupMember();
    const res = await api().get("/member/detail").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.memberNick).toBe(input.memberNick);
  });

  // Regression: an old logout wrote the literal string "null" into the cookie,
  // which then shadowed a valid Authorization header.
  it('ignores an "accessToken=null" cookie and falls back to the header', async () => {
    const { auth } = await signupMember();
    const res = await api()
      .get("/member/detail")
      .set(auth)
      .set("Cookie", "accessToken=null");
    expect(res.status).toBe(200);
  });
});

describe("logout", () => {
  // Regression: res.cookie(name, null) stored the string "null".
  it("clears the cookie instead of writing null into it", async () => {
    const { auth } = await signupMember();
    const res = await api().post("/member/logout").set(auth);

    expect(res.status).toBe(200);
    const cookie = cookiesOf(res);
    expect(cookie).toMatch(/accessToken=;/);
    expect(cookie).not.toMatch(/accessToken=null/);
  });
});
