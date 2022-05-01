import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Game } from "src/app/model/game/game";
import { Profile } from "src/app/model/profile";
import { User } from "src/app/model/user";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";
import { environment } from "src/environments/environment";

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
    this.delegateService.profile.subscribe((p) => {
      this.profile = p;
    });

    this.user = this.iamService.userValue;
    this.profile = this.delegateService.profileValue;
  }

  ngOnInit(): void {
    if (this.profile == null) {
      const user = this.iamService.userValue;
      this.delegateService.getProfile(
        user.id,
        user.token,
        user.username,
        () => {
        },
        () => {
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
    sessionStorage.setItem(DelegateService.H_ITEM, JSON.stringify(game.history));
    this.router.navigate(["/" + environment.hy]);
  }

  returnHome() {
    this.router.navigate([environment.h]);
  }
}
