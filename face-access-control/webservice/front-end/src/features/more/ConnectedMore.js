import { connect } from "react-redux";
import { smash } from "dux/more";
import More from "./More";

// maps the redux state to this components props
const mapStateToProps = state => ( {
  destroyed: state.more.destroyed,
} );

// provide the component with the dispatch method
const mapDispatchToProps = dispatch => ( {
  destroy: () => {
    dispatch( smash() );
  },
} );

export default connect( mapStateToProps, mapDispatchToProps )( More );
