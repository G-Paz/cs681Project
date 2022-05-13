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
import { IamService } from "../../service/iam.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LinkGuard implements CanActivate {
  constructor(
    private router: Router,
    private iamService: IamService,
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
    const user = this.iamService.userValue;
    if (user) {
      // check if route is restricted by role
      if (route.data.roles && route.data.roles.indexOf(user.role) === -1) {
        // role not authorised so redirect to home page
        this.router.navigate(["/"]);
        return false;
      }

      // authorised so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
