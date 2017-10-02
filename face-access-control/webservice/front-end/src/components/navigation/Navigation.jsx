import React from "react";
import PropTypes from "prop-types";
import "./Navigation.css";
import { NavLink } from "react-router-dom";
import FontAwesome from "react-fontawesome";

const icon = require( "assets/images/intel-facial-recognition.svg" );

const Navigation = ( { toggleLog, logOn } ) => (
  <nav className="navigation">
    <span className="logo-title navBtn"></span>
    <div className="navBtns">
      <NavLink className="navBtn" exact to="/"><FontAwesome name="camera" size="2x" /></NavLink>
      <NavLink className="navBtn" exact to="/directory"><FontAwesome name="id-card-o" size="2x" /></NavLink>
      <NavLink className="navBtn" exact to="/stats"><FontAwesome name="area-chart" size="2x" /></NavLink>
      <a className={ `navBtn history ${ logOn ? "active" : "" }` } onClick={ toggleLog }><FontAwesome name="clock-o" size="2x" /></a>
    </div>
  </nav>
);

Navigation.propTypes = {
  toggleLog: PropTypes.func.isRequired,
  logOn: PropTypes.bool.isRequired,
};

Navigation.defaultProps = {

/*  label: undefined,
  click: undefined,
  data: undefined,*/
};

export default Navigation;
