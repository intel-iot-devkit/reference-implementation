import { LABELS, HTTP } from "constants/constants";

// actions
const TOGGLE = "features/something/TOGGLE";
const THING = "features/something/THING";
const THING_LOAD_REQUEST = "features/something/THING_LOAD_REQUEST";
const THING_LOADED = "features/something/THING_LOADED";
const THING_ERROR = "features/something/THING_ERROR";

// initial state
const initialState = {
  message: LABELS.START_TEXT,
  active: false,
  count: 0,
  isFetching: false,
  lastTrack: undefined,
};

// Reducer
export default function reducer( state = initialState, action = {} ) {
  switch ( action.type ) {
    case TOGGLE:
      return {
        ...state,
        active: !state.active,
        count: state.count + 1,
      };
    case THING:
      return {
        ...state,
        message: action.words,
      };
    case THING_LOAD_REQUEST:
      return {
        ...state,
        isFetching: action.isFetching,
      };
    case THING_LOADED:
      return {
        ...state,
        isFetching: action.isFetching,
        lastTrack: action.lastTrack,
      };
    case THING_ERROR:
      return {
        ...state,
        isFetching: action.isFetching,
      };
    default: return state;
  }
}

// syncronous (instant) action creators
export function toggle() {
  return { type: TOGGLE };
}

export function doThing( words ) {
  return { type: THING, words };
}

// ------ http request related actions ------ //

// initialize loading state
function startThingLoad() {
  return {
    type: THING_LOAD_REQUEST,
    isFetching: true,
  };
}

// load completed
function thingOneLoaded( json ) {
  return {
    type: THING_LOADED,
    isFetching: false,
    lastTrack: json.recenttracks.track[ 0 ].name,
  };
}

// loading error
function thingOneLoadError( error ) {
  return {
    type: THING_ERROR,
    isFetching: false,
    error,
  };
}

// asyncronous action creator
export function loadLastTrack() {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startThingLoad() );
    // load the data
    return fetch( HTTP.LAST_API )
      .then( response => response.json() )
      .then( json =>
        // dispatched loaded data
        dispatch( thingOneLoaded( json ) ),
      )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( thingOneLoadError( error ) ),
      );
  };
}
