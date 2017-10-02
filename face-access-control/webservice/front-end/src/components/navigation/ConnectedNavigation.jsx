import { connect } from "react-redux";
import Navigation from "./Navigation";
import { toggleLog } from "../../dux/log";

// maps the redux state to this components props
const mapStateToProps = state => ( {
  logOn: state.log.logOn,
} );

// provide the component with the dispatch method
const mapDispatchToProps = dispatch => ( {
  toggleLog: () => {
    dispatch( toggleLog() );
  },
} );

export default connect( mapStateToProps, mapDispatchToProps )( Navigation );
