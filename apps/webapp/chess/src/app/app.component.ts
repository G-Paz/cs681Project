import { Component } from "@angular/core";
import { Game } from "./game";
import { IamService } from "./iam.service";
import { Role } from "./role";
import { User } from "./user";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "chess";
  user: User | undefined;
  game: Game | undefined;

  constructor(private iamService: IamService) {
    this.iamService.user.subscribe((x) => (this.user = x));
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  get loggedIn(){
    return this.user != undefined;
  }

  get notLoggedIn(){
    return this.user == undefined;
  }

  get notInGame(){
    return this.game != undefined;
  }
}
