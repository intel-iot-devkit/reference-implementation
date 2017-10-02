import React from "react";
import PropTypes from "prop-types";
import ConnectedCameraFeed from "../../features/camera-feed/ConnectedCameraFeed";

class Monitor extends React.Component {
  constructor( props ) {
    super( props );
  }

  render() {
    return (
      <ConnectedCameraFeed />
    );
  }
}

Monitor.propTypes = {
  // this provides route info, will cause lint error
  match: PropTypes.object,
};

Monitor.defaultProps = {
  match: {},
};

export default Monitor;