import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { interval, Subscription } from "rxjs";
import { Game } from "src/app/model/game/game";
import { GameColumn } from "src/app/model/game/state/game-column";
import { DelegateService } from "src/app/service/delegate.service";
import { IamService } from "src/app/service/iam.service";

const REFRESH_RATE_MILISECONDS = 10000;
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
    private formBuilder: FormBuilder
  ) {
    // initialze the board ids
    this.columnIds = new Array<number>(1, 2, 3, 4, 5, 6, 7, 8);
    this.rowIds = new Array<number>(8, 7, 6, 5, 4, 3, 2, 1);
    // set the game state watcher
    this.delegateService.game.subscribe(
      (gameState) => (this.gameState = gameState)
    );
    this.gameState = this.delegateService.gameValue;
    // set the game status watcher
    this.delegateService.status.subscribe(
      (statusMessage) => (this.serverMessage = statusMessage)
    );
    // init to be replaced in ngOnInit
    this.serverMessage = "";
    // initialize game refresh
    this.refreshGame = interval(REFRESH_RATE_MILISECONDS).subscribe((int) => {
      if (this.isGameDone()) {
        console.error("game is done - unsubscribing");
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
      user.id,
      user.username
    );
  }

  quitGame() {
    var user = this.iamService.userValue;
    this.delegateService.quitGame(this.gameState._id, user.id, user.token);
    this.stopRefresh();
  }

  isGameDone() {
    return (
      this.gameState != undefined && this.gameState.winner_player != undefined
    );
  }

  exitGame() {
    this.stopRefresh();
    this.delegateService.localQuitGame();
  }

  stopRefresh() {
    if (!this.refreshGame.closed) {
      console.error("unsubscribing refreshing action");
      this.refreshGame.unsubscribe();
    }
  }

  hasUserWon() {
    var user = this.iamService.userValue;
    console.log("the player is" + user.id);
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
      this.delegateService.createGameState(user.token, user.id, user.username);
    }
  }

  getCharValue(id: number) {
    return String.fromCharCode("A".charCodeAt(0) + id - 1);
  }

  getNumberValue(id: string) {
    return id.charCodeAt(0) - "A".charCodeAt(0);
  }
}
