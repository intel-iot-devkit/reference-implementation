import { HTTP } from "../constants/constants";

// initial state
const initialState = {
  faceCoordinates: undefined,
  imgData: "",
  isFetching: false,
};

// actions
const FEED_IMAGE_LOAD_REQUEST = "features/feed-image/FEED_IMAGE_LOAD_REQUEST";
const FEED_IMAGE_LOADED = "features/feed-image/FEED_IMAGE_LOADED";
const FEED_IMAGE_ERROR = "features/feed-image/FEED_IMAGE_ERROR";

// Reducer
export default function reducer( state = initialState, action = {} ) {
  switch ( action.type ) {
    case FEED_IMAGE_LOAD_REQUEST:
      return {
        ...state,
        isFetching: action.isFetching,
      };
    case FEED_IMAGE_LOADED:
      return {
        ...state,
        isFetching: action.isFetching,
        imgData: action.imgData,
        faceCoordinates: action.faceCoordinates,
      };
    case FEED_IMAGE_ERROR:
      return {
        ...state,
        isFetching: action.isFetching,
      };
    default: return state;
  }
}

// ------ http request related actions ------ //

// initialize loading state
function startImageDataLoad() {
  return {
    type: FEED_IMAGE_LOAD_REQUEST,
    isFetching: true,
  };
}

// load completed
function imageDataLoaded( blob, faceCoordinates ) {
  return {
    type: FEED_IMAGE_LOADED,
    isFetching: false,
    imgData: blob,
    faceCoordinates,
  };
}

// loading error
function imageDataLoadError( error ) {
  return {
    type: FEED_IMAGE_ERROR,
    isFetching: false,
    error,
  };
}

// asyncronous action creator
export function loadFeedImageSetCoordinates( imgUrl, faceCoordinates ) {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startImageDataLoad() );
    // load the data
    const imgUrlEscaped = imgUrl ? imgUrl.replace( /\//g, "%2F" ) : null;

    return fetch( `${ HTTP.GET_IMAGE }${ imgUrlEscaped }`, { method: "GET", mode: "no-cors" } )
      .then( () => {
        dispatch( imageDataLoaded( `${ HTTP.GET_IMAGE }${ imgUrlEscaped }`, faceCoordinates ) );
      } )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( imageDataLoadError( error ) ),
      );
  };
}
