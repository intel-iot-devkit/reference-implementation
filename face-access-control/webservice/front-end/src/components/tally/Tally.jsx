import React from "react";
import PropTypes from "prop-types";
import { CLEARANCE } from "../../constants/constants";
import "./Tally.css";

const Tally = ( { counts } ) => (
  <div className="tally-body">
    <div className="tally-header">Session Stats</div>
    <div className="tally-pane-container">
      <div className="tally-pane Tally-type-a divider">
        <span className="count">{ counts.A }</span>
        <span className="label">{ CLEARANCE.A } Clearance</span>
      </div>
      <div className="tally-pane tally-type-b divider">
        <span className="count">{ counts.B }</span>
        <span className="label">{ CLEARANCE.B } Clearance</span>
      </div>
      <div className="tally-pane tally-type-c divider">
        <span className="count">{ counts.C }</span>
        <span className="label">{ CLEARANCE.C } Clearance</span>
      </div>
      <div className="tally-pane tally-type-d divider">
        <span className="count">{ counts.D }</span>
        <span className="label">{ CLEARANCE.D } Clearance</span>
      </div>
      <div className="tally-pane tally-unknown">
        <span className="count">{ counts.UNKNOWN }</span>
        <span className="label">{ CLEARANCE.UNKNOWN }</span>
      </div>
    </div>
  </div>
);

Tally.propTypes = {
  counts: PropTypes.shape( {
    A: PropTypes.number.isRequired,
    B: PropTypes.number.isRequired,
    C: PropTypes.number.isRequired,
    D: PropTypes.number.isRequired,
    UNKNOWN: PropTypes.number.isRequired,
  } ).isRequired,
};

export default Tally;
