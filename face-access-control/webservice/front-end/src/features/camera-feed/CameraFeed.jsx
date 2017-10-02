import React from "react";
import PropTypes from "prop-types";
import FontAwesome from "react-fontawesome";
import cx from "classnames";
import "./CameraFeed.css";
import mq from "../../MqttClient";
import { HTTP, MQTT, SETTINGS } from "../../constants/constants";

class CameraFeed extends React.Component {
  constructor( props ) {
    super( props );
    this.handleMqtt = this.handleMqtt.bind( this );
    this.updateCameraFeed = this.updateCameraFeed.bind( this );
    this.displayAlertMessage = this.displayAlertMessage.bind( this );
    this.ctx = undefined;
    this.logId = this.logId.bind( this );
    this.refreshImage = this.refreshImage.bind( this );
    this.retractTimeout = undefined;
    this.idCheckTimer = undefined;
    this.mjpgSrc = HTTP.CAMERA_FEED;

    this.state = {
      unknown: false,
      alertOut: false,
      lastId: undefined,
      idCheckTimerExpired: true,
      mjpgSrc: this.mjpgSrc,
    };
  }
  componentDidMount() {
    // register handler with mqtt client
    mq.addHandler( "image", this.handleMqtt );
  }
  componentWillUnmount() {
    mq.removeHandler( "image" );
    clearTimeout( this.retractTimeout );
    clearTimeout( this.idCheckTimer );
  }
  // not currently used
  handleMqtt( topic, payload ) {
    switch ( topic ) {
      case MQTT.TOPICS.IMAGE:
        this.updateCameraFeed( payload.fullImage, payload.faceCoordinates );
        break;
      case MQTT.TOPICS.SEEN:
        this.displayAlertMessage( payload.id );
        break;
      case MQTT.TOPICS.REGISTERED:
        break;
      default:
        break;
    }
  }
  refreshImage() {
    const d = new Date();
    this.setState( { mjpgSrc: `${this.mjpgSrc}?ver=${ d.getTime() }` } );
  }
  updateCameraFeed( imgUrl, faceCoordinates ) {
    this.props.loadFeedImageSetCoordinates( imgUrl, faceCoordinates );
  }
  logId( id ) {
    clearTimeout( this.retractTimeout );
    if ( id !== "UNKNOWN" ) {
      this.props.loadProfile( id );
      this.setState( { unknown: false, alertOut: true, lastId: id, idCheckTimerExpired: false } );
    } else {
      this.props.addUnknownToLog();
      this.setState( { unknown: true, alertOut: true, lastId: id, idCheckTimerExpired: false } );
    }
    this.idCheckTimer = setTimeout( () => {
      this.setState( { idCheckTimerExpired: true } );
    }, 8000 );
    this.retractTimeout = setTimeout( () => {
      this.setState( { unknown: false, alertOut: false } );
    }, 2000 );
  }

  displayAlertMessage( id ) {
    if ( this.state.lastId !== id ) { /* first check to see if there is a new person or it is undefined */
      /* this is a new person, log them and set another timer so they don't get logged again within a specified interval */
      clearTimeout( this.idCheckTimer );
      this.logId( id );
    } else if ( this.state.idCheckTimerExpired === true ) {
    // the time has expired log them again regardless

      this.logId( id );
    }
  }

  render() {
    const profileName = this.props.profileData && !this.state.unknown ? this.props.profileData.name : "not identified";

    const profileImg = this.state.alertOut && this.props.profileData && !this.state.unknown ?
      <img className="profile-pic" alt="profile pic" src={ `${ HTTP.GET_IMAGE }profile%2F${ this.props.profileData.id }.jpg` } />
     :
     null;

    const alertState = cx( "alert-box", { "alert-out": this.state.alertOut }, { "unknown": this.state.unknown }, { "known": !this.state.unknown } );

    const width = SETTINGS.CAMERA_FEED_WIDTH;//640

    const imgStyle = { "maxWidth": `${ width }px` };

    return (
      <div className="camera-feed" >
        <div className="camera-feed-container">
          <img src={ this.state.mjpgSrc } alt="camera feed" style={ imgStyle } onClick={ this.refreshImage } className="camera-feed-img" />
        </div>
         <div className={ alertState }>
          <div className="top-strip" >
            <FontAwesome className="check" name="check" size="4x" />
          </div>
          <div className="profile-img-holder">
            { profileImg }
          </div>
          <div className="message">{ profileName }</div>
        </div>
      </div>
    );
  }
}

CameraFeed.propTypes = {
  faceCoordinates: PropTypes.object,
  imgData: PropTypes.string,
  loadFeedImageSetCoordinates: PropTypes.func.isRequired,
  addUnknownToLog: PropTypes.func.isRequired,
  loadProfile: PropTypes.func.isRequired,
  profileData: PropTypes.object,
};

CameraFeed.defaultProps = {
  faceCoordinates: undefined,
  imgData: undefined,
  profileData: undefined,
};

export default CameraFeed;
