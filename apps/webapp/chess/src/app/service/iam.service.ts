import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { EMPTY } from "rxjs/internal/observable/empty";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Role } from "../model/role";
import { User } from "../model/user";
import { Validation } from "../model/validation";

const U_ITEM = "user";
const U_PARAM = "userId";
const T_PARAM = "token";
const US_PARAM = "username";
const P_PARAM = "password";

@Injectable({
  providedIn: "root",
})
export class IamService {
  public userSubject: BehaviorSubject<any>;
  public user: Observable<User>;

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<User>(
      JSON.parse(sessionStorage.getItem(U_ITEM) + "")
    );
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  createAccount(username: string, password: string) {
    return this.http
      .post<User>(environment.cr_a_ep, null, {
        params: new HttpParams()
          .set(US_PARAM, username)
          .set(P_PARAM, password),
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem(U_ITEM, JSON.stringify(user));
          this.userSubject.next(user);
          return user;
        }),
        catchError((err, caught) => {
          console.error(err);
          console.error(caught);
          return EMPTY;
        })
      );
  }

  isValidSession(user: User) {
    return this.http
      .get<Validation>(environment.i_v_ep,{
        params: new HttpParams()
          .set(U_PARAM, user.id)
          .set(T_PARAM, user.token),
      })
      .subscribe((res) => {
        if (!res.isValid){
          this.logout()
        }
      })
  }

  login(username: string, password: string) {
    return this.http
      .post<User>(environment.a_ep, null, {
        params: new HttpParams()
          .set(US_PARAM, username)
          .set(P_PARAM, password),
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem(U_ITEM, JSON.stringify(user));
          this.userSubject.next(user);
          return user;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    sessionStorage.removeItem(U_ITEM);
    this.userSubject.next(null);
    this.router.navigate(["/login"]);
  }
}

