import { isValidPhone } from "../src/libs/config";

describe("isValidPhone", () => {
  it.each(["01012345678", "+82 10-1234-5678", "(010) 1234 5678", "+998901234567"])(
    "accepts %s",
    (phone) => expect(isValidPhone(phone)).toBe(true),
  );

  it.each(["", "12345678", "1234567890123456", "abc123456789", "010@1234#5678", 1012345678, null])(
    "rejects %p",
    (phone) => expect(isValidPhone(phone)).toBe(false),
  );
});
