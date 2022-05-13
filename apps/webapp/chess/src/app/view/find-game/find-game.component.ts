import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Game } from "src/app/model/game/game";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-find-game",
  templateUrl: "./find-game.component.html",
  styleUrls: ["./find-game.component.css"],
})
export class FindGameComponent implements OnInit {
  allGames: Array<Game>;
  joinStatus: string;
  lastGame: string | undefined;

  constructor(
    private delegateService: DelegateService,
    private iamService: IamService,
    private router: Router
  ) {
    // set the game state watcher
    this.delegateService.allGames.subscribe((x) => (this.allGames = x));
    this.allGames = this.delegateService.allGamesValue;

    this.delegateService.gameStatus.subscribe((x) => (this.joinStatus = x));
    this.joinStatus = ''

    this.delegateService.lastGame.subscribe((x) => {
      console.log("1234123412")
      this.lastGame = x;
    });
  }

  ngOnInit(): void {
    this.refreshGames();
  }

  refreshGames() {
    var user = this.iamService.userValue;
    this.delegateService.getAllGames(user.id, user.token);
    this.delegateService.loadGameIfExists(user)
  }

  get gameExists() {
    return this.lastGame != null && this.lastGame != undefined;
  }

  nextGames(){
    this.refreshGames();
  }

  joinLastGame() {
    var gameId = this.lastGame
    if (gameId != null) {
      var user = this.iamService.userValue;
      this.delegateService.joinGame(
        gameId,
        user.id,
        user.token,
        user.username,
        () => {
          this.router.navigate(["/" + environment.gs]);
        }
      );
    }
  }

  joinGame(game: Game){
    var user = this.iamService.userValue;
    this.delegateService.joinGame(game._id, user.id, user.token,
      user.username, () => {
      this.router.navigate(["/" + environment.gs]);
    });
  }
}
