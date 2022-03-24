import { Role } from "./role";

export class User {
  constructor(id: number, public username: string, public role: Role, public token?: string) {}
}
