import MemberModel from "../src/schema/Member.model";
import { api, signupMember } from "./helpers";

describe("POST /member/update", () => {
  it("requires a logged-in member", async () => {
    const res = await api().post("/member/update").send({ memberAddress: "Seoul" });
    expect(res.status).toBe(401);
  });

  // Regression: the bare document was returned, and the client, which reads
  // `data.member`, stored undefined and blanked the app.
  it("updates the profile and returns it wrapped as { member }", async () => {
    const { auth } = await signupMember();
    const res = await api()
      .post("/member/update")
      .set(auth)
      .send({ memberAddress: "Seoul", memberDesc: "Dog lover" });

    expect(res.status).toBe(200);
    expect(res.body.member.memberAddress).toBe("Seoul");
    expect(res.body.member.memberDesc).toBe("Dog lover");
  });

  it("ignores role, status, points and password sent by the client", async () => {
    const { auth, input } = await signupMember();
    const res = await api().post("/member/update").set(auth).send({
      memberDesc: "hi",
      memberType: "ADMIN",
      memberStatus: "BLOCK",
      memberPoints: 9999,
      memberPassword: "new-plain-password",
    });

    expect(res.status).toBe(200);
    expect(res.body.member).toMatchObject({
      memberDesc: "hi",
      memberType: "USER",
      memberStatus: "ACTIVE",
      memberPoints: 0,
    });
    // The old password still works, so nothing was stored unhashed.
    const login = await api()
      .post("/member/login")
      .send({ memberNick: input.memberNick, memberPassword: input.memberPassword });
    expect(login.status).toBe(200);
  });

  it("rejects an invalid phone number", async () => {
    const { auth } = await signupMember();
    const res = await api()
      .post("/member/update")
      .set(auth)
      .send({ memberPhone: "12-ab" });
    expect(res.status).toBe(400);
  });
});

describe("GET /member/detail", () => {
  it("returns 404 for a member who has been blocked", async () => {
    const { auth, member } = await signupMember();
    await MemberModel.updateOne({ _id: member._id }, { memberStatus: "BLOCK" });

    const res = await api().get("/member/detail").set(auth);
    expect(res.status).toBe(404);
  });
});

describe("GET /member/top-users", () => {
  it("lists members with the most points first", async () => {
    const points = [3, 10, 1, 7, 5];
    for (const memberPoints of points) {
      const { member } = await signupMember();
      await MemberModel.updateOne({ _id: member._id }, { memberPoints });
    }

    const res = await api().get("/member/top-users");
    expect(res.status).toBe(200);
    expect(res.body.map((m: any) => m.memberPoints)).toEqual([10, 7, 5, 3]);
  });
});
