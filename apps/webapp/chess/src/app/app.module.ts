import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS, HttpXsrfTokenExtractor } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
// import { HttpXsrfCookieExtractor, HttpXsrfInterceptor, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from "./HttpXsrfInterceptor";
import { CreateaccountComponent } from "./view/createaccount/createaccount.component";
import { FindGameComponent } from "./view/find-game/find-game.component";
import { FindUserComponent } from "./view/find-user/find-user.component";
import { GameStateComponent } from "./view/game-state/game-state.component";
import { HistoryComponent } from "./view/history/history.component";
import { LoginComponent } from "./view/login/login.component";
import { ProfileComponent } from "./view/profile/profile.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreateaccountComponent,
    GameStateComponent,
    FindGameComponent,
    ProfileComponent,
    HistoryComponent,
    FindUserComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientXsrfModule.withOptions()
  ],
  providers: [
    // { provide: HTTP_INTERCEPTORS, useExisting: HttpClientXsrfModule, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
