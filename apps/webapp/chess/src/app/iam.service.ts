import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { EMPTY } from "rxjs/internal/observable/empty";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Role } from "./role";
import { User } from "./user";
import { Validation } from "./validation";

@Injectable({
  providedIn: "root",
})
export class IamService {
  public userSubject: BehaviorSubject<any>;
  public user: Observable<User>;

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<any>(
      JSON.parse(sessionStorage.getItem("user") + "")
    );
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  createAccount(username: string, password: string) {
    console.log("username " + username + " password " + password);
    return this.http
      .post<User>(`${environment.iamUrl}/createaccount`, null, {
        params: new HttpParams()
          .set("username", username)
          .set("password", password),
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem("user", JSON.stringify(user));
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
    console.log("username " + user.id + " token " + user.token);
    return this.http
      .get<Validation>(`${environment.iamUrl}/isValidSession`,{
        params: new HttpParams()
          .set("userId", user.id)
          .set("token", user.token),
      })
      .subscribe((res) => {
        if (!res.isValid){
          this.logout()
        }
      })
  }

  login(username: string, password: string) {
    return this.http
      .get<any>(`${environment.iamUrl}/users/authenticate`, {
        params: new HttpParams()
          .set("username", username)
          .set("password", password),
      })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem("user", JSON.stringify(user));
          this.userSubject.next(user);
          return user;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    sessionStorage.removeItem("user");
    this.userSubject.next(null);
    this.router.navigate(["/login"]);
  }
}

