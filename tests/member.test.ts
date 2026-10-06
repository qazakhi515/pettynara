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

  it("rejects an invalid phone number", async () => {
    const { auth } = await signupMember();
    const res = await api()
      .post("/member/update")
      .set(auth)
      .send({ memberPhone: "12-ab" });
    expect(res.status).toBe(400);
  });
});
