import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './view/login/login.component';
import { CreateaccountComponent } from './view/createaccount/createaccount.component';
import { GameStateComponent } from './view/game-state/game-state.component';
import { FindGameComponent } from './view/find-game/find-game.component';
import { ProfileComponent } from './view/profile/profile.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreateaccountComponent,
    GameStateComponent,
    FindGameComponent,
    ProfileComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
