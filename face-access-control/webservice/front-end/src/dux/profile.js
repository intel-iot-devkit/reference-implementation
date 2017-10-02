import { HTTP } from "../constants/constants";
import moment from 'moment';

// initial state
const initialState = {
  profileData: undefined,
  isFetching: false,
  logList: [],
};

// actions
const PROFILE_LOAD_REQUEST = "PROFILE_LOAD_REQUEST";
const PROFILE_LOADED = "PROFILE_LOADED";
const PROFILE_ERROR = "PROFILE_ERROR";
const ADD_TO_LOG = "ADD_TO_LOG";

// Reducer
export default function reducer( state = initialState, action = {} ) {
  switch ( action.type ) {
    case PROFILE_LOAD_REQUEST:
      return {
        ...state,
        isFetching: action.isFetching,
      };
    case PROFILE_LOADED:
      return {
        ...state,
        isFetching: action.isFetching,
        profileData: action.profileData,
      };
    case PROFILE_ERROR:
      return {
        ...state,
        isFetching: action.isFetching,
      };
    case ADD_TO_LOG:
      return {
        ...state,
        isFetching: action.isFetching,
        logList: [ ...state.logList, action.logList ],
      };
    default: return state;
  }
}

// ------ http request related actions ------ //

// initialize loading state
function startImageDataLoad() {
  return {
    type: PROFILE_LOAD_REQUEST,
    isFetching: true,
  };
}

// load completed
function imageDataLoaded( profileData ) {
  return {
    type: PROFILE_LOADED,
    isFetching: false,
    profileData,
  };
}

// loading error
function imageDataLoadError( error ) {
  return {
    type: PROFILE_ERROR,
    isFetching: false,
    error,
  };
}

function addProfileToLog( profileData ) {
  const d = new Date();
  const time = d.toLocaleTimeString();
  const epochTime = moment().valueOf();
  const imgUrl =  `${ HTTP.GET_IMAGE }profile%2F${ profileData.id }.jpg`;
  const clearanceType =  profileData.clearanceType;
  const newLogItem = { profileImg: imgUrl, time, epochTime, name: profileData.name, clearanceType };
  return {
    type: ADD_TO_LOG,
    isFetching: false,
    logList: newLogItem,
  };
}

export function addUnknownToLog() {
  const d = new Date();
  const time = d.toLocaleTimeString();
  const epochTime = moment().valueOf();
  const newLogItem = { time, epochTime };
  return {
    type: ADD_TO_LOG,
    isFetching: false,
    logList: newLogItem,
  };
}


// asyncronous action creator
export function loadProfile( id ) {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startImageDataLoad() );
    // load the data

    return fetch( `${ HTTP.GET_PROFILE }${ id }`, { method: "GET" } )
      .then( response => response.json() )
      .then( body => {
        dispatch( imageDataLoaded( body.data[ 0 ] ) );
        dispatch( addProfileToLog( body.data[ 0 ] ) );
      } )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( imageDataLoadError( error ) ),
      );
  };
}
