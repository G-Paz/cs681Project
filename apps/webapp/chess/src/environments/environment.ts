// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // iam endpoints
  cr_a_ep: "/iapi/createaccount",
  i_v_ep: "/iapi/isValidSession",
  a_ep: "/iapi/authenticate",

  // delegate endpoints
  gs_ep: "/api/gameState",
  cg_ep: "/api/createGame",
  sm_ep: "/api/submitMove",
  gag_ep: "/api/getAllGames",
  jg_ep: "/api/joinGame",
  qg_ep: "/api/quitGame",
  ggp_ep: "/api/getGameProfile",

  // in-app endpoints
  h: "/",
  l: "login",
  cra: "createaccount",
  gs: "gamestate",
  p: "profile",
  fg: "findgame",
  hy: "history",
  fus: "finduser",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
