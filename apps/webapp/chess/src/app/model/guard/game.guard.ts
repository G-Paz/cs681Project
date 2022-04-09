import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { DelegateService } from "src/app/service/delegate.service";

@Injectable({
  providedIn: "root",
})
export class GameGuard implements CanActivate {
  constructor(
    private router: Router,
    private delegateService: DelegateService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const game = this.delegateService.gameValue;
    if (game) {
      console.error("not here");
      this.router.navigate(["/gamestate"]);
      return false;
    }
    console.error("or not here");
    // not logged in so redirect to login page with the return url
    return true;
  }
}
