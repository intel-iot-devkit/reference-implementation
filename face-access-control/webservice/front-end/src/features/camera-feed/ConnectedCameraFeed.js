import { connect } from "react-redux";
import { loadFeedImageSetCoordinates } from "dux/cameraFeed";
import { loadProfile, addUnknownToLog } from "dux/profile";
import CameraFeed from "./CameraFeed";

// maps the redux state to this components props
const mapStateToProps = state => ( {
  faceCoordinates: state.cameraFeed.faceCoordinates,
  imgData: state.cameraFeed.imgData,
  profileData: state.profile.profileData,
} );

// provide the component with the dispatch method
const mapDispatchToProps = dispatch => ( {
  loadFeedImageSetCoordinates: ( imgUrl, faceCoordinates ) => {
    dispatch( loadFeedImageSetCoordinates( imgUrl, faceCoordinates ) );
  },
  loadProfile: ( profileData ) => {
    dispatch( loadProfile( profileData ) );
  },
  addUnknownToLog: () => {
    dispatch( addUnknownToLog() );
  },
} );

export default connect( mapStateToProps, mapDispatchToProps )( CameraFeed );
