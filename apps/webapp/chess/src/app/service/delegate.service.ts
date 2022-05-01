import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { environment } from "src/environments/environment";
import { Game } from "../model/game/game";
import { Profile } from "../model/profile";

const G_PARAM = "gameId";
const U_PARAM = "userId";
const T_PARAM = "token";
const US_PARAM = "username";

const FC_PARAM = "fromColumnId";
const FR_PARAM = "fromRowId";
const TC_PARAM = "toColumnId";
const TR_PARAM = "toRowId";

@Injectable({
  providedIn: "root",
})
export class DelegateService {
  // public static constants
  static P_ITEM = "profile";
  static H_ITEM = "history";
  static G_ITEM = "game";

  // instance vars
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
      JSON.parse(sessionStorage.getItem(DelegateService.G_ITEM) + "")
    );
    this.game = this.gameSubject.asObservable();

    // initialize the game status
    this.gameStatus = new BehaviorSubject<string>("");
    this.status = this.gameStatus.asObservable();

    // initialize the game status
    this.allGames = new BehaviorSubject<any>(new Array<Game>());
    this.games = this.allGames.asObservable();

    // initialize the game status
    this.profileSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem(DelegateService.P_ITEM) + ""));
    this.profile = this.profileSubject.asObservable();
  }

  public getGameState(gameId: number, token: string, userId: number) {
    return this.http
      .post<Game>(environment.gs_ep, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set(G_PARAM, gameId)
          .set(U_PARAM, userId)
          .set(T_PARAM, token),
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

  public createGameState(token: string, userId: number, username: string) {
    return this.http
      .post<Game>(environment.cg_ep, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set(U_PARAM, userId)
          .set(T_PARAM, token)
          .set(US_PARAM, username),
      })
      .subscribe((res) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        this.setGame(res);
        return res;
      });
  }

  public submitMove(
    fromColumnId: string,
    fromRowId: number,
    toColumnId: string,
    toRowId: number,
    gameId: number,
    token: string,
    userId: number,
    username: string
  ) {
    return this.http
      .post<Game>(environment.sm_ep, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set(FC_PARAM, fromColumnId)
          .set(FR_PARAM, fromRowId)
          .set(TC_PARAM, toColumnId)
          .set(TR_PARAM, toRowId)
          .set(G_PARAM, gameId)
          .set(U_PARAM, userId)
          .set(T_PARAM, token)
          .set(US_PARAM, username),
      })
      .subscribe(
        (res) => {
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

  public getAllGames(userId: number, token: string) {
    return this.http
      .get<Array<Game>>(environment.gag_ep, {
        headers: new HttpHeaders(),
        params: new HttpParams().set(U_PARAM, userId).set(T_PARAM, token),
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

  public joinGame(
    gameId: number,
    userId: number,
    token: string,
    username: string,
    complete: () => void
  ) {
    return this.http
      .post<Game>(environment.jg_ep, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set(G_PARAM, gameId)
          .set(U_PARAM, userId)
          .set(T_PARAM, token)
          .set(US_PARAM, username),
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

  public quitGame(gameId: number, userId: number, token: string) {
    this.http
      .post<any>(environment.qg_ep, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set(G_PARAM, gameId)
          .set(U_PARAM, userId)
          .set(T_PARAM, token),
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

  public getProfile(userId: number, token: string, username: string, complete: () => void, failed: () => void) {
    return this.http
      .post<Profile>(environment.ggp_ep, null, {
        headers: new HttpHeaders(),
        params: new HttpParams()
          .set(U_PARAM, userId)
          .set(T_PARAM, token)
          .set(US_PARAM, username),
      })
      .subscribe(
        (res) => {
          console.log(res);
          if (res!=null && res.username != null) {
            sessionStorage.setItem(DelegateService.P_ITEM, JSON.stringify(res));
            this.profileSubject.next(res);
            complete()
          } else {
            this.removeProfile();
            failed()
          }
          return res;
        }
      );
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

  public localQuitGame() {
    this.router.navigate([environment.h]);
    sessionStorage.removeItem(DelegateService.G_ITEM);
    this.gameSubject.next(null);
    this.gameStatus.next("");
  }
  public removeProfile() {
    this.profileSubject.next(null);
    sessionStorage.removeItem(DelegateService.P_ITEM);
  }

  public logout(gameId: number, userId: number, token: string) {
    if (gameId) {
      this.quitGame(gameId, userId, token);
    } else {
      this.localQuitGame();
    }
  }

  private removeGame(res: any) {
    sessionStorage.removeItem(DelegateService.G_ITEM);
    this.gameSubject.next(null);
  }

  private setGame(res: Game) {
    sessionStorage.setItem(DelegateService.G_ITEM, JSON.stringify(res));
    this.gameSubject.next(res);
  }
}
