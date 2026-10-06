import { api, signupMember } from "./helpers";

const updateWithFile = async (file: Buffer, filename: string, contentType: string) => {
  const { auth } = await signupMember();
  return api()
    .post("/member/update")
    .set(auth)
    .attach("memberImage", file, { filename, contentType });
};

describe("image uploads", () => {
  it("reject files that are not images with 400", async () => {
    const res = await updateWithFile(Buffer.from("hello"), "notes.txt", "text/plain");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/image/i);
  });

  it("reject images larger than 5 MB with 400", async () => {
    const big = Buffer.alloc(5 * 1024 * 1024 + 1);
    const res = await updateWithFile(big, "big.png", "image/png");
    expect(res.status).toBe(400);
  });
});
