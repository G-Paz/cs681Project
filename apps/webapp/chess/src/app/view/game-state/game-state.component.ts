import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
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

  constructor(
    private delegateService: DelegateService,
    private iamService: IamService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // initialze the board ids
    this.columnIds = new Array<number>(1, 2, 3, 4, 5, 6, 7, 8);
    this.rowIds = new Array<number>(8,7,6,5,4,3,2,1);
    // set the game state watcher
    this.delegateService.game.subscribe((x) => (this.gameState = x));
    this.gameState = this.delegateService.gameValue;
    // set the game status watcher
    this.delegateService.status.subscribe((x) => (this.serverMessage = x));
    // init to be replaced in ngOnInit
    this.gameForm = this.formBuilder.group({});
    this.serverMessage = '';
  }

  getCharValue(id: number) {
    return String.fromCharCode("A".charCodeAt(0) + id - 1);
  }

  getNumberValue(id: string) {
    return id.charCodeAt(0) - "A".charCodeAt(0);
  }

  getGamePieces() {
    var rows = this.gameState.state;
    var pieces = new Array<GameColumn>();
    rows.forEach((row) => {
      row.columns.forEach((column) => {
        column.rowId = row.rowId - 1;
        pieces.push(column);
      });
    });
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
    this.delegateService.quitGame();
  }

  ngOnInit(): void {
    var user = this.iamService.userValue;
    if (user && this.gameState) {
      this.delegateService.getGameState(
        this.gameState._id,
        user.token,
        user.id
      );
    } else {
      this.delegateService.createGameState(user.token, user.id);
    }
    this.gameForm = this.formBuilder.group({
      fromColumnId: ["", Validators.required],
      fromRowId: ["", Validators.required],
      toRowId: ["", Validators.required],
      toColumnId: ["", Validators.required],
    });
  }
}