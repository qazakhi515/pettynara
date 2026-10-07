import { api, memberInput, signupMember } from "./helpers";

// Requests are made "from" an address by setting the header Nginx would add.
const from = (ip: string) => ({ "X-Forwarded-For": ip });

const login = (memberNick: string, memberPassword: string, ip = "203.0.113.1") =>
  api().post("/member/login").set(from(ip)).send({ memberNick, memberPassword });

describe("login rate limits", () => {
  it("locks a nick after 5 wrong passwords from the same IP", async () => {
    const { input } = await signupMember();

    for (let i = 0; i < 5; i++) {
      const res = await login(input.memberNick, "wrong-password");
      expect(res.status).toBe(401);
    }

    const locked = await login(input.memberNick, "wrong-password");
    expect(locked.status).toBe(429);
    expect(Number(locked.headers["retry-after"])).toBeGreaterThan(0);
  });

  it("refuses even the right password while locked", async () => {
    const { input } = await signupMember();
    for (let i = 0; i < 5; i++) await login(input.memberNick, "wrong-password");

    const res = await login(input.memberNick, input.memberPassword);
    expect(res.status).toBe(429);
  });

  it("counts wrong guesses for unknown nicks too", async () => {
    for (let i = 0; i < 5; i++) await login("nobody", "guess");
    const res = await login("nobody", "guess");
    expect(res.status).toBe(429);
  });

  it("does not lock the same nick for another IP", async () => {
    const { input } = await signupMember();
    for (let i = 0; i < 5; i++) await login(input.memberNick, "wrong", "203.0.113.1");

    const otherIp = await login(input.memberNick, input.memberPassword, "198.51.100.7");
    expect(otherIp.status).toBe(200);
  });

  it("clears the count after a successful login", async () => {
    const { input } = await signupMember();
    for (let i = 0; i < 4; i++) await login(input.memberNick, "wrong");
    expect((await login(input.memberNick, input.memberPassword)).status).toBe(200);

    for (let i = 0; i < 4; i++) await login(input.memberNick, "wrong");
    const res = await login(input.memberNick, input.memberPassword);
    expect(res.status).toBe(200);
  });

  it("limits all login attempts from one IP to 20 per 15 minutes", async () => {
    for (let i = 0; i < 20; i++) {
      const res = await login(`nick${i}`, "guess");
      expect(res.status).toBe(404);
    }
    const res = await login("nick20", "guess");
    expect(res.status).toBe(429);
  });
});

describe("signup rate limit", () => {
  const signup = (ip: string) =>
    api().post("/member/signup").set(from(ip)).send(memberInput());

  it("allows 5 accounts per IP per hour", async () => {
    for (let i = 0; i < 5; i++) expect((await signup("203.0.113.9")).status).toBe(201);

    const res = await signup("203.0.113.9");
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/too many/i);
  });

  it("counts each IP separately", async () => {
    for (let i = 0; i < 5; i++) await signup("203.0.113.9");
    const res = await signup("198.51.100.7");
    expect(res.status).toBe(201);
  });
});
