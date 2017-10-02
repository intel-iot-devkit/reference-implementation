import { connect } from "react-redux";
import { push } from "react-router-redux";
import { toggle, doThing, loadLastTrack } from "dux/something";
import { LABELS } from "constants/constants";
import Something from "./Something";

// maps the redux state to this components props
const mapStateToProps = state => ( {
  count: state.something.count,
  active: state.something.active,
  message: state.something.message,
  isFetching: state.something.isFetching,
  lastTrack: state.something.lastTrack,
} );

// provide the component with the dispatch method
const mapDispatchToProps = dispatch => ( {
  loadTrack: () => {
    dispatch( loadLastTrack() );
  },
  countUp: () => {
    dispatch( doThing( LABELS.END_TEXT ) );
    dispatch( toggle() );
  },
  changePage: ( data ) => {
    dispatch( push( data.url ) );
  },
} );

export default connect( mapStateToProps, mapDispatchToProps )( Something );
