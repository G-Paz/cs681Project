import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { environment } from "src/environments/environment";
import { Game } from "../model/game/game";
import { Profile } from "../model/profile";

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
  public profileSubject: BehaviorSubject<any>;
  public profile: Observable<Profile>;

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
    // initialize the game status
    this.profileSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem("profile") + ""));
    this.profile = this.profileSubject.asObservable();
  }

  public get gameValue(): Game {
    return this.gameSubject.value;
  }

  public get profileValue(): Profile {
    return this.profileSubject.value;
  }

  public get allGamesValue(): Array<Game> {
    return this.allGames.value;
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
          this.setGame(res);
          return res;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  createGameState(token: string, userId: number, username: string) {
    console.log("creating game state");
    return this.http
      .post<Game>(`${environment.delegateUrl}/createGame`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("userId", userId)
          .set("token", token)
          .set("username", username),
      })
      .subscribe((res) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        this.setGame(res);
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
    userId: number,
    username: string
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
          .set("token", token)
          .set("username", username),
      })
      .subscribe(
        (res) => {
          console.log(res);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.setGame(res);
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

  joinGame(
    gameId: number,
    userId: number,
    token: string,
    username: string,
    complete: () => void
  ) {
    console.log("joining game");
    return this.http
      .post<Game>(`${environment.delegateUrl}/joinGame`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token)
          .set("username", username),
      })
      .subscribe(
        (res) => {
          console.error(res);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.setGame(res);
          this.gameStatus.next("");
          complete();
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
      .post<any>(`${environment.delegateUrl}/quitGame`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token),
      })
      .subscribe(
        (res) => {
          console.log("successfully quit game");
          this.removeGame(res);
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
    this.router.navigate(["/"]);
    sessionStorage.removeItem("game");
    this.gameSubject.next(null);
    this.gameStatus.next("");
  }
  removeProfile() {
    this.profileSubject.next(null);
    sessionStorage.removeItem("profile");
  }

  logout(gameId: number, userId: number, token: string) {
    if (gameId) {
      this.quitGame(gameId, userId, token);
    } else {
      this.localQuitGame();
    }
  }

  getProfile(userId: number, token: string, username: string, complete: () => void, failed: () => void) {
    return this.http
      .post<Profile>(`${environment.delegateUrl}/getGameProfile`, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set("userId", userId)
          .set("token", token)
          .set("username", username),
      })
      .subscribe(
        (res) => {
          console.log(res);
          if (res!=null && res.username != null) {
            console.log("userfound with username" + username)
            sessionStorage.setItem("profile", JSON.stringify(res));
            this.profileSubject.next(res);
            complete()
          } else {
            this.removeProfile();
            failed()
          }
          return res;
        },
        (error) => {
          console.error("Error loading profile:" + error);
        }
      );
  }

  private removeGame(res: any) {
    sessionStorage.removeItem("game");
    this.gameSubject.next(null);
  }

  private setGame(res: Game) {
    sessionStorage.setItem("game", JSON.stringify(res));
    this.gameSubject.next(res);
  }
}
