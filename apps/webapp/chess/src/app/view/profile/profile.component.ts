import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Game } from "src/app/model/game/game";
import { Profile } from "src/app/model/profile";
import { User } from "src/app/model/user";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  profile: Profile;
  user: User;

  constructor(
    private delegateService: DelegateService,
    private iamService: IamService,
    private router: Router
  ) {
    this.delegateService.profile.subscribe((x) => {
      this.profile = x;
      console.log(x);
    });

    this.user = this.iamService.userValue;
    this.profile = this.delegateService.profileValue;
  }

  ngOnInit(): void {
    if (this.profile == null) {
      console.log("profile is null")
      console.log(this.delegateService.profileValue)
      const user = this.iamService.userValue;
      this.delegateService.getProfile(
        user.id,
        user.token,
        user.username,
        () => {
          console.log("loaded current user profile")
        },
        () => {
          console.log("user has not played a game - defaults")
          this.profile = new Profile(0,0,this.user.username, [])
        }
      );
    }
  }

  getGames() {
    return this.profile.games;
  }

  userWonGame(game: Game) {
    return this.profile.username == game.winner_player_username ? "Yes" : "No";
  }

  viewGame(game: Game) {
    sessionStorage.setItem("history", JSON.stringify(game.history));
    this.router.navigate(["/history"]);
  }

  returnHome() {
    this.router.navigate(["/"]);
  }
}
