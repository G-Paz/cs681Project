import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { environment } from "src/environments/environment";
import { ExitHistoryGuard } from "./model/guard/exit-history.guard";
import { ExitProfileGuard } from "./model/guard/exit-profile.guard";
import { GameGuard } from "./model/guard/game.guard";
import { HistoryGuard } from "./model/guard/history.guard";
import { LinkGuard } from "./model/guard/link.guard";
import { CreateaccountComponent } from "./view/createaccount/createaccount.component";
import { FindGameComponent } from "./view/find-game/find-game.component";
import { FindUserComponent } from "./view/find-user/find-user.component";
import { GameStateComponent } from "./view/game-state/game-state.component";
import { HistoryComponent } from "./view/history/history.component";
import { LoginComponent } from "./view/login/login.component";
import { ProfileComponent } from "./view/profile/profile.component";

const routes: Routes = [
  {
    path: environment.l,
    component: LoginComponent,
  },
  {
    path: environment.cra,
    component: CreateaccountComponent,
  },
  {
    path: environment.gs,
    component: GameStateComponent,
    canActivate: [LinkGuard],
  },
  {
    path: environment.p,
    component: ProfileComponent,
    canActivate: [LinkGuard],
    canDeactivate: [ExitProfileGuard],
  },
  {
    path: environment.fg,
    component: FindGameComponent,
    canActivate: [LinkGuard, GameGuard],
  },
  {
    path: environment.hy,
    component: HistoryComponent,
    canActivate: [LinkGuard, HistoryGuard],
    canDeactivate: [ExitHistoryGuard],
  },
  {
    path: environment.fus,
    component: FindUserComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
