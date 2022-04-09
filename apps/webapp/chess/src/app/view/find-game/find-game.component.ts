import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Game } from "src/app/model/game/game";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";

@Component({
  selector: "app-find-game",
  templateUrl: "./find-game.component.html",
  styleUrls: ["./find-game.component.css"],
})
export class FindGameComponent implements OnInit {
  allGames: Array<Game>;
  joinStatus: string
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
  }

  ngOnInit(): void {
    this.refreshGames();
  }

  refreshGames() {
    var user = this.iamService.userValue;
    this.delegateService.getAllGames(user.id, user.token);
  }

  nextGames(){
    this.refreshGames();
  }

  joinGame(game: Game){
    var user = this.iamService.userValue;
    this.delegateService.joinGame(game._id, user.id, user.token, () => {
      this.router.navigate(["/gamestate"]);
    });
  }
}
