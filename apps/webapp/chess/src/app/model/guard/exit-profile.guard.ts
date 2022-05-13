import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  NavigationStart,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { DelegateService } from "src/app/service/delegate.service";

@Injectable({
  providedIn: "root",
})
export class ExitProfileGuard implements CanDeactivate<unknown> {
  subscription: any;
  constructor(
    private delegateService: DelegateService,
    private router: Router
  ) {
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url != "/profile") {
        this.delegateService.removeProfile();
      }
    });
  }
  canDeactivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    this.delegateService.removeProfile();
    return true;
  }
}
