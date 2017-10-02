import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

// add all reducers
import directory from "./directory";
import something from "./something";
import more from "./more";
import cameraFeed from "./cameraFeed";
import profile from "./profile";
import log from "./log";

// combine and export
export default combineReducers( {
  router: routerReducer,
  directory,
  something,
  more,
  cameraFeed,
  profile,
  log,
} );
