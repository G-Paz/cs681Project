import { Profile } from "./profile";

describe("Profile", () => {
  it("should create an instance", () => {
    expect(new Profile(1, "null", 2, 3)).toBeTruthy();
  });
});
