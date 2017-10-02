// actions
const SMASH = "features/more/SMASH";

// initial state
const initialState = {
  destroyed: false,
};

// Reducer
export default function reducer( state = initialState, action = {} ) {
  switch ( action.type ) {
    case SMASH:
      return {
        ...state,
        destroyed: !state.destroyed,
      };
    default: return state;
  }
}

// action creators
export function smash() {
  return { type: SMASH };
}
