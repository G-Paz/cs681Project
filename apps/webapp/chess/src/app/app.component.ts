import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { interval } from "rxjs/internal/observable/interval";
import { Subscription } from "rxjs/internal/Subscription";
import { Game } from "./model/game/game";
import { Role } from "./model/role";
import { User } from "./model/user";
import { DelegateService } from "./service/delegate.service";
import { IamService } from "./service/iam.service";

const LOGOUT_LIMIT = 900000; // 15minutes
const LOGOUT_REFRESH_RATE = 10000;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "chess";
  user: User;
  game: Game;
  logoutHandler: Subscription;
  timeoutTime: Date

  constructor(
    private iamService: IamService,
    private delegateService: DelegateService,
    private router: Router
  ) {
    // set the user information
    this.iamService.user.subscribe((x) => (this.user = x));
    this.user = this.iamService.userValue;

    // set the game state if exists
    this.delegateService.game.subscribe((x) => (this.game = x));
    this.game = this.delegateService.gameValue;

    // determine the page that should be loaded based on the objects set
    if (this.user) {
      if (this.game) {
        this.router.navigate(["/gamestate"]);
      }
    } else {
      this.router.navigate(["/login"]);
    }
    
    // initialize the timeout time
    this.timeoutTime = getNewTimeOutTime();
    // set the onload function to reset the timer
    window.onload = this.resetTimer
    // add the listener to reset the timer when the user moves the mouse
    document.addEventListener("mousemove", this.resetTimer)
    // initialize game refresh
    this.logoutHandler = interval(LOGOUT_REFRESH_RATE).subscribe((int) => {
      if (this.timeoutTime.getTime() < Date.now()) {
        alert("You have been logged out.");
        console.error("the user has been logged out");
        this.logout()
      }
    });
  }

  private resetTimer(){
    this.timeoutTime = getNewTimeOutTime();
  }

  ngOnInit() {
    this.iamService.isValidSession(this.user);
    this.delegateService.loadGameIfExists(this.user)
  }

  logout() {
    if(this.game){
      this.delegateService.logout(this.game._id, this.user.id, this.user.token);
    }
    this.iamService.logout();
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
function getNewTimeOutTime(): Date {
  return new Date(Date.now() + LOGOUT_LIMIT);
}

