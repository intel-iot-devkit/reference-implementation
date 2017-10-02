// actions
const TOGGLE_LOG = "features/log/TOGGLE_LOG";

// initial state
const initialState = {
  logOn: false,
};

// Reducer
export default function reducer( state = initialState, action = {} ) {
  switch ( action.type ) {
    case TOGGLE_LOG:
      return {
        ...state,
        logOn: !state.logOn,
      };
    default: return state;
  }
}

// action creators
export function toggleLog() {
  return { type: TOGGLE_LOG };
}
