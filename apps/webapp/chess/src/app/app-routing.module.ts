import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateaccountComponent } from './view/createaccount/createaccount.component';
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
