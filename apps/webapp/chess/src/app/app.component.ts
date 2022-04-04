import { Component } from "@angular/core";
import { Game } from "./model/game/game";
import { IamService } from "./service/iam.service";
import { Role } from "./model/role";
import { User } from "./model/user";
import { DelegateService } from "./service/delegate.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "chess";
  user: User;
  game: Game;

  constructor(
    private iamService: IamService,
    private delegateService: DelegateService,
    private router: Router
  ) {
    this.iamService.user.subscribe((x) => (this.user = x));
    this.user = this.iamService.userValue;
    this.delegateService.game.subscribe((x) => (this.game = x));
    this.game = this.delegateService.gameValue;
    if(this.user){
      if (this.game) {
        this.router.navigate(["/gamestate"]);
      }
    }else{
      this.router.navigate(["/login"]);
    }
  }

  ngOnInit() {
    this.iamService.isValidSession(this.user);
  }

  logout() {
    this.iamService.logout();
    this.delegateService.logout();
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  get loggedIn() {
    return this.user != undefined;
  }

  get notLoggedIn() {
    return this.user == undefined;
  }

  get notInGame() {
    return this.game == undefined;
  }
}
