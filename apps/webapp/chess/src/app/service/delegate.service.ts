import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { EMPTY } from "rxjs/internal/observable/empty";
import { catchError } from "rxjs/internal/operators/catchError";
import { map } from "rxjs/internal/operators/map";
import { environment } from "src/environments/environment";
import { Game } from "../model/game/game";

@Injectable({
  providedIn: "root",
})
export class DelegateService {
  public gameSubject: BehaviorSubject<any>;
  public game: Observable<Game>;
  public gameStatus: BehaviorSubject<any>;
  public status: Observable<string>;
  public allGames: BehaviorSubject<Array<Game>>;
  public games: Observable<Array<Game>>;

  constructor(private router: Router, private http: HttpClient) {
    //initialize the game from the one stored in the browser
    this.gameSubject = new BehaviorSubject<Game>(
      JSON.parse(sessionStorage.getItem("game") + "")
    );
    this.game = this.gameSubject.asObservable();
    // initialize the game status
    this.gameStatus = new BehaviorSubject<string>("");
    this.status = this.gameStatus.asObservable();
    // initialize the game status
    this.allGames = new BehaviorSubject<any>(new Array<Game>());
    this.games = this.allGames.asObservable();
  }

  getGameState(gameId: number, token: string, userId: number) {
    console.log("getting game state");
    return this.http
      .post<Game>(`${environment.delegateUrl}/gameState`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token),
      })
      .subscribe(
        (res) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem("game", JSON.stringify(res));
          this.gameSubject.next(res);
          return res;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  createGameState(token: string, userId: number) {
    console.log("creating game state");
    return this.http
      .post<Game>(`${environment.delegateUrl}/createGame`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams().set("userId", userId).set("token", token),
      })
      .subscribe((res) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        sessionStorage.setItem("game", JSON.stringify(res));
        this.gameSubject.next(res);
        return res;
      });
  }

  submitMove(
    fromColumnId: string,
    fromRowId: number,
    toColumnId: string,
    toRowId: number,
    gameId: number,
    token: string,
    userId: number
  ) {
    console.log("persisting move");
    return this.http
      .post<Game>(`${environment.delegateUrl}/submitMove`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("fromColumnId", fromColumnId)
          .set("fromRowId", fromRowId)
          .set("toColumnId", toColumnId)
          .set("toRowId", toRowId)
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token),
      })
      .subscribe(
        (res) => {
          console.error(res);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem("game", JSON.stringify(res));
          this.gameSubject.next(res);
          this.gameStatus.next("");
          return res;
        },
        (error) => {
          console.error("Error persisting move:" + error);
          this.gameStatus.next("That was an invalid move.");
        }
      );
  }

  getAllGames(userId: number, token: string) {
    console.log("joining game");
    return this.http
      .get<Array<Game>>(`${environment.delegateUrl}/getAllGames`, {
        headers: new HttpHeaders(),
        params: new HttpParams().set("userId", userId).set("token", token),
      })
      .subscribe(
        (res) => {
          console.error(res);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.allGames.next(res);
          return res;
        },
        (error) => {
          console.error("Error loading games:" + error);
        }
      );
  }

  joinGame(gameId: number, userId: number, token: string, complete: () => void) {
    console.log("joining game");
    return this.http
      .post<Game>(`${environment.delegateUrl}/joinGame`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token),
      })
      .subscribe(
        (res) => {
          console.error(res);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem("game", JSON.stringify(res));
          this.gameSubject.next(res);
          this.gameStatus.next("");
          complete()
          return res;
        },
        (error) => {
          console.error("Error joining game:" + error);
          this.gameStatus.next("Unable to join game... ;/");
        }
      );
  }

  quitGame(gameId: number, userId: number, token: string) {
    this.http
      .post<Game>(`${environment.delegateUrl}/quitGame`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token),
      })
      .subscribe(
        (res) => {
          console.log("successfully quit game");
          return res;
        },
        (error) => {
          console.error("Error quitting game:" + error);
        }
      );
    // remove user from local storage to log user out
    this.localQuitGame();
  }

  localQuitGame() {
    sessionStorage.removeItem("game");
    this.gameSubject.next(null);
    this.gameStatus.next("");
    this.router.navigate(["/"]);
  }

  logout(gameId: number, userId: number, token: string) {
    if (gameId) {
      this.quitGame(gameId, userId, token);
    } else {
      this.localQuitGame();
    }
  }

  public get gameValue(): Game {
    return this.gameSubject.value;
  }

  public get allGamesValue(): Array<Game> {
    return this.allGames.value;
  }
}
