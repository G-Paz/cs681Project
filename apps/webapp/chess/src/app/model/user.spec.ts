import { Role } from "./role";
import { User } from "./user";

describe("User", () => {
  it("should create an instance", () => {
    expect(new User(1, "", Role.Admin, "")).toBeTruthy();
  });
});
