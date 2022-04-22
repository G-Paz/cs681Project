import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HistoryGuard implements CanActivate {
  constructor(
    private router: Router,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    
    if (sessionStorage.getItem("history") != null) {
      console.log("game history set");
      return true;
    }
    console.log("game state does not exist");
    // not logged in so redirect to login page with the return url
    return false;
  }
}
