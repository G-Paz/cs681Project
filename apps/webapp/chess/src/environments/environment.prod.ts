export const environment = {
  production: true,
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
