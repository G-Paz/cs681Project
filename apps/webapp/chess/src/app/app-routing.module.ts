import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameGuard } from './model/guard/game.guard';
import { LinkGuard } from './model/guard/link.guard';
import { CreateaccountComponent } from './view/createaccount/createaccount.component';
import { FindGameComponent } from './view/find-game/find-game.component';
import { GameStateComponent } from './view/game-state/game-state.component';
import { LoginComponent } from './view/login/login.component';

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "createaccount",
    component: CreateaccountComponent,
  },
  {
    path: "gamestate",
    component: GameStateComponent,
    canActivate:[LinkGuard]
  },
  {
    path: "findgame",
    component: FindGameComponent,
    canActivate:[LinkGuard, GameGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
