import { connect } from "react-redux";
import Log from "./Log";

// maps the redux state to this components props
const mapStateToProps = state => ( {
  logList: state.profile.logList,
  logOn: state.log.logOn,
} );

export default connect( mapStateToProps )( Log );
