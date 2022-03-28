import { HttpClient, HttpParams } from "@angular/common/http";
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

  constructor(private router: Router, private http: HttpClient) {
    this.gameSubject = new BehaviorSubject<Game>(
      JSON.parse(sessionStorage.getItem("game") + "")
    );
    this.game = this.gameSubject.asObservable();
  }

  getGameState(gameId: number, token: string, userId: number) {
    console.log("getting game state")
    return this.http
      .get<Game>(`${environment.delegateUrl}/gameState`, {
        params: new HttpParams()
          .set("gameId", gameId)
          .set("userId", userId)
          .set("token", token),
      })
      .subscribe((res) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        sessionStorage.setItem("game", JSON.stringify(res));
        this.gameSubject.next(res);
        return res;
      })
  }

  quitGame() {
    // remove user from local storage to log user out
    sessionStorage.removeItem("game");
    this.gameSubject.next(null);
    this.router.navigate(["/"]);
  }

  public get gameValue(): Game {
    return this.gameSubject.value;
  }
}
