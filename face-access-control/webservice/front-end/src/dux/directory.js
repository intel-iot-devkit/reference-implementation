import { HTTP } from "constants/constants";

// actions
const CONTACT_LOAD_REQUEST = "pages/directory/CONTACT_LOAD_REQUEST";
const CONTACT_LOADED = "pages/directory/CONTACT_LOADED";
const CONTACT_ERROR = "pages/directory/CONTACT_ERROR";

const CONTACT_ALL_LOAD_REQUEST = "pages/directory/CONTACT_ALL_LOAD_REQUEST";
const CONTACT_ALL_LOADED = "pages/directory/CONTACT_ALL_LOADED";
const CONTACT_ALL_ERROR = "pages/directory/CONTACT_ALL_ERROR";

const MONITOR_START_REQUEST = "pages/directory/MONITOR_START_REQUEST";
const MONITOR_START_SUCCEED = "pages/directory/MONITOR_START_SUCCEED";
const MONITOR_START_ERROR = "pages/directory/MONITOR_START_ERROR";

const MONITOR_STOP_REQUEST = "pages/directory/MONITOR_STOP_REQUEST";
const MONITOR_STOP_SUCCEED = "pages/directory/MONITOR_STOP_SUCCEED";
const MONITOR_STOP_ERROR = "pages/directory/MONITOR_STOP_ERROR";

const SAVE_NEW_REQUEST = "pages/directory/SAVE_NEW_REQUEST";
const SAVE_NEW_SUCCEEDED = "pages/directory/SAVE_NEW_SUCCEEDED";
const SAVE_NEW_ERROR = "pages/directory/SAVE_NEW_ERROR";

const PERSON_REGISTERED = "pages/directory/PERSON_REGISTERED";


// initial state
const initialState = {
  currentId: null,
  contactList: [],
  newProfile: {},
  saveStatus: "",
  error: null,
  isFetchingContact: false,
  isFetchingAllContact: false,
  isAddingNewPerson: false,
  isMonitorFetch: false,
  returnedPerson: undefined,
  haveRegisteredPerson: false,
};

// reducer
export default function reducer( state = initialState, action = {} ) {
  switch ( action.type ) {
    // Load single contact
    case CONTACT_LOAD_REQUEST:
      return {
        ...state,
        isFetchingContact: action.isFetchingContact,
      };
    case CONTACT_LOADED:
      return {
        ...state,
        isFetchingContact: action.isFetchingContact,
        currentId: action.currentId,
      };
    case CONTACT_ERROR:
      return {
        ...state,
        isFetchingContact: action.isFetchingContact,
      };
    
    // Load all contacts
    case CONTACT_ALL_LOAD_REQUEST:
      return {
        ...state,
        isFetchingAllContact: action.isFetchingAllContact,
      };
    case CONTACT_ALL_LOADED: 
      return {
        ...state,
        isFetchingAllContact: action.isFetchingAllContact,
        contactList: action.contactList,
      };
    case CONTACT_ALL_ERROR:
      return {
        ...state,
        isFetchingAllContact: action.isFetchingAllContact,
      };

    // Save new contact
    case SAVE_NEW_REQUEST:
      return {
        ...state,
        isAddingNewPerson: action.isAddingNewPerson,
      };
    case SAVE_NEW_SUCCEEDED: 
      return {
        ...state,
        isAddingNewPerson: action.isAddingNewPerson,
      };
    case SAVE_NEW_ERROR:
      return {
        ...state,
        isAddingNewPerson: action.isAddingNewPerson,
      };
    case PERSON_REGISTERED:
      return {
        ...state,
        returnedPerson: action.returnedPerson,
        haveRegisteredPerson: action.haveRegisteredPerson,
      };

    default: return state;
  }
}
// syncronous (instant) action creators

// ------ http request related actions ------ //

// ------ LOAD SINGLE RECORD ------ //
// initialize loading state
function startContactLoad() {
  return {
    type: CONTACT_LOAD_REQUEST,
    isFetchingContact: true,
  };
}

// load completed
function contactLoaded( json ) {
  return {
    type: CONTACT_LOADED,
    isFetchingContact: false,
    currentId: "123", // json.data.id
  };
}

// loading error
function contactAllError( error ) {
  return {
    type: CONTACT_ALL_ERROR,
    isFetchingContact: false,
    error,
  };
}

// ------ LOAD ALL RECORDS ------ //
// initialize loading state
function startContactAllLoad() {
  return {
    type: CONTACT_ALL_LOAD_REQUEST,
    isFetchingAllContact: true,
  };
}

// load completed
function contactAllLoaded( json ) {
  return {
    type: CONTACT_ALL_LOADED,
    isFetchingAllContact: false,
    contactList: json.data,
  };
}

// loading error
function contactAllError( error ) {
  return {
    type: CONTACT_ALL_ERROR,
    isFetchingAllContact: false,
    error,
  };
}

// ------ START MONITOR ------ //
// initialize monitor
function startMonitorBegin() {
  return {
    type: MONITOR_START_REQUEST,
    isMonitorFetch: true,
  };
}

// monitor start
function startMonitorSucceed( json ) {
  return {
    type: MONITOR_START_SUCCEED,
    isMonitorFetch: false,
    returnedPerson: json.data,
  };
}

// monitor start failure
function startMonitorError( error ) {
  return {
    type: MONITOR_START_ERROR,
    isMonitorFetch: false,
    error,
  };
}

// ------ STOP MONITOR ------ //
// initialize loading state
function stopMonitorBegin() {
  return {
    type: MONITOR_STOP_REQUEST,
    isMonitorFetch: true,
  };
}

// load completed
function stopMonitorSucceed() {
  return {
    type: MONITOR_STOP_SUCCEED,
    isMonitorFetch: false,
    returnedPerson: null,
  };
}

// loading error
function stopMonitorError( error ) {
  return {
    type: MONITOR_STOP_ERROR,
    isMonitorFetch: false,
    error,
  };
}

// ------ SAVE NEW RECORD ------ //
// initialize loading state
function startSaveNew() {
  return {
    type: SAVE_NEW_REQUEST,
    isAddingNewPerson: true,
  };
}

// load completed
function saveNewSucceeded( json ) {
  if (json.status === "success") {
    return {
      type: SAVE_NEW_SUCCEEDED,
      isAddingNewPerson: false,
      currentId: json.data.id,
      saveStatus: "saved",
      returnedPerson: undefined,
      haveRegisteredPerson: false,
    };
  } else return{
    type: SAVE_NEW_ERROR,
    isAddingNewPerson: false,
    error: json.errors,
  }
}

// loading error
function saveNewError( error ) {
  return {
    type: SAVE_NEW_ERROR,
    isAddingNewPerson: false,
    error,
  };
}

// load completed
export function personRegistered( id ) {
  return {
    type: PERSON_REGISTERED,
    returnedPerson: id,
    haveRegisteredPerson: true,
  };
}


// asyncronous action creator
export function loadContact(contactID) {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startContactLoad() );
    // load the data
    let contactUrl = HTTP.DATA_SINGLE_CONTACT += contactId; 
    return fetch( contactUrl )
      .then( response => response.json() )
      .then( json =>
        // dispatched loaded data
        dispatch( contactLoaded( json ) ),
      )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( contactError( error ) ),
      );
  };
}

export function loadAllContacts() {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startContactAllLoad() );
    // load the data
    let contactUrl = HTTP.DATA_ALL_CONTACTS; 
    return fetch( contactUrl )
      .then( response => response.json() )
      .then( json =>
        // dispatched loaded data
        dispatch( contactAllLoaded( json ) ),
      )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( contactAllError( error ) ),
      );
  };
}

export function startMonitoring() {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startMonitorBegin() );
    // send the data
    let watchTopic = MQTT.REGISTERED; 
    return fetch( watchTopic )
      .then( response => response.json() )
      .then( 
        json =>
        // dispatched loaded data
        dispatch( startMonitorSucceed( json ) ),
      )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( startMonitorError( error ) ),
      );
  };
}

export function stopMonitoring() {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( stopMonitorBegin() );
    // send the data
    let watchTopic = MQTT.REGISTERED; 
    return fetch( watchTopic )
      .then( response => response.json() )
      .then( 
        json =>
        // dispatched loaded data
        dispatch( stopMonitorSucceed( json ) ),
      )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( stopMonitorError( error ) ),
      );
  };
}


export function saveNewContact( newPerson ) {
  return ( dispatch ) => {
    // dispatch to start a spinner or to disable mouse actions
    dispatch( startSaveNew() );
    // send the data
    let contactUrl = HTTP.DATA_INSERT_PROFILE; 
    return fetch( contactUrl, { method: "POST", body: JSON.stringify(newPerson), headers: { "Content-Type": "application/json" } } )
      .then( response => response.json() )
      .then( 
        json =>
        // dispatched loaded data
        dispatch( saveNewSucceeded( json ) )
      )
      .catch( error =>
        // dispatched an http error occurred
        dispatch( saveNewError( error ) ),
      );
  };
}
