import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { interval, Observable, Subscription } from "rxjs";
import { Game } from "src/app/model/game/game";
import { GameColumn } from "src/app/model/game/state/game-column";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";

@Component({
  selector: "app-game-state",
  templateUrl: "./game-state.component.html",
  styleUrls: ["./game-state.component.css"],
})
export class GameStateComponent implements OnInit {
  columnIds: Array<number>;
  rowIds: Array<number>;
  gameState: Game;
  gameForm: FormGroup;
  serverMessage: string;
  refreshGame: Subscription;

  constructor(
    private delegateService: DelegateService,
    private iamService: IamService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // initialze the board ids
    this.columnIds = new Array<number>(1, 2, 3, 4, 5, 6, 7, 8);
    this.rowIds = new Array<number>(8, 7, 6, 5, 4, 3, 2, 1);
    // set the game state watcher
    this.delegateService.game.subscribe((x) => (this.gameState = x));
    this.gameState = this.delegateService.gameValue;
    // set the game status watcher
    this.delegateService.status.subscribe((x) => (this.serverMessage = x));
    // init to be replaced in ngOnInit
    this.serverMessage = "";
    // initialize game refresh
    this.refreshGame = interval(10000).subscribe((val) => {
      if (this.isGameDone()) {
        this.refreshGame.unsubscribe();
      } else {
        this.initGame();
      }
    });
    // set form validations
    this.gameForm = this.formBuilder.group({
      fromColumnId: ["", Validators.required],
      fromRowId: ["", Validators.required],
      toRowId: ["", Validators.required],
      toColumnId: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.initGame();
  }

  getGamePieces() {
    var pieces = new Array<GameColumn>();
    if (this.gameState) {
      var rows = this.gameState.state;
      rows.forEach((row) => {
        row.columns.forEach((column) => {
          column.rowId = row.rowId - 1;
          pieces.push(column);
        });
      });
    }
    return pieces;
  }

  submitMove() {
    var user = this.iamService.userValue;
    var gameControls = this.gameForm.controls;
    this.delegateService.submitMove(
      gameControls.fromColumnId.value,
      gameControls.fromRowId.value,
      gameControls.toColumnId.value,
      gameControls.toRowId.value,
      this.gameState._id,
      user.token,
      user.id
    );
  }

  quitGame() {
    var user = this.iamService.userValue;
    this.delegateService.quitGame(this.gameState._id, user.id, user.token);
  }

  isGameDone() {
    return (
      this.gameState != undefined && this.gameState.winner_player != undefined
    );
  }

  exitGame() {
    if(!this.refreshGame.closed){
      this.refreshGame.unsubscribe()
    }
    this.delegateService.localQuitGame()
  }

  hasUserWon() {
    var user = this.iamService.userValue;

    console.log('the winner is' + this.gameState.winner_player);

    console.log('the player is' + user.id);
    return (
      this.gameState != undefined && this.gameState.winner_player == user.id
    );
  }

  isUsersTurn() {
    var user = this.iamService.userValue;
    return (
      this.gameState != undefined && this.gameState.current_player == user.id
    );
  }

  isWaiting() {
    return (
      this.gameState != undefined &&
      this.gameState.br_player != undefined &&
      this.gameState.br_player >= 0 &&
      this.gameState.w_player == -1
    );
  }

  inGame() {
    return (
      this.gameState != undefined &&
      this.gameState.br_player != undefined &&
      this.gameState.br_player >= 0 &&
      this.gameState.w_player != undefined &&
      this.gameState.w_player >= 0
    );
  }

  initGame() {
    var user = this.iamService.userValue;
    if (this.gameState) {
      this.delegateService.getGameState(
        this.gameState._id,
        user.token,
        user.id
      );
    } else {
      this.delegateService.createGameState(user.token, user.id);
    }
  }

  getCharValue(id: number) {
    return String.fromCharCode("A".charCodeAt(0) + id - 1);
  }

  getNumberValue(id: string) {
    return id.charCodeAt(0) - "A".charCodeAt(0);
  }
}
