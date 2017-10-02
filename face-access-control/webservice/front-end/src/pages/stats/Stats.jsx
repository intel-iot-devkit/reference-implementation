import React from "react";
import PropTypes from "prop-types";
import moment from 'moment';
import Tally from "components/tally/Tally";
import DonutChart from "components/chart-donut/DonutChart";
import ScatterChart from "components/chart-scatter/ScatterChart";
import { CLEARANCE, CLEARANCE_COLORS } from "../../constants/constants";
import "./Stats.css";

const Stats = ( { logList } ) => {
  let counts = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    UNKNOWN: 0,
  };
  let visitorsA = [];
  let visitorsB = [];
  let visitorsC = [];
  let visitorsD = [];
  let visitorsUnknown = [];

  if ( logList && logList.length > 0 ) {
    for ( let i = 0; i < logList.length; i += 1 ) {
      const timeSinceMidnight = moment( logList[ i ].epochTime ).diff( moment().startOf( "day" ) );
      if ( logList[ i ].clearanceType === "A" ) {
        counts.A += 1;
        visitorsA.push( { x: timeSinceMidnight, y: "5" } );
      } else if ( logList[ i ].clearanceType === "B" ) {
        counts.B += 1;
        visitorsB.push( { x: timeSinceMidnight, y: "4" } );
      } else if ( logList[ i ].clearanceType === "C" ) {
        counts.C += 1;
        visitorsC.push( { x: timeSinceMidnight, y: "3" } );
      } else if ( logList[ i ].clearanceType === "D" ) {
        counts.D += 1;
        visitorsD.push( { x: timeSinceMidnight, y: "2" } );
      } else {
        counts.UNKNOWN += 1;
        visitorsUnknown.push( { x: timeSinceMidnight, y: "1" } );
      }
    }
  }

  const donutData = {
    labels: [
      CLEARANCE.A,
      CLEARANCE.B,
      CLEARANCE.C,
      CLEARANCE.D,
      CLEARANCE.UNKNOWN,
    ],
    datasets: [ {
      data: [ counts.A, counts.B, counts.C, counts.D, counts.UNKNOWN ],
      backgroundColor: [
        CLEARANCE_COLORS.A,
        CLEARANCE_COLORS.B,
        CLEARANCE_COLORS.C,
        CLEARANCE_COLORS.D,
        CLEARANCE_COLORS.UNKNOWN,
      ],
      hoverBackgroundColor: [
        CLEARANCE_COLORS.A_HOVER,
        CLEARANCE_COLORS.B_HOVER,
        CLEARANCE_COLORS.C_HOVER,
        CLEARANCE_COLORS.D_HOVER,
        CLEARANCE_COLORS.UNKNOWN_HOVER,
      ],
    } ],
  };

  const scatterData = {
    labels: [ CLEARANCE.A, CLEARANCE.B, CLEARANCE.C, CLEARANCE.D, CLEARANCE.UNKNOWN ],
    datasets: [
      {
        label: CLEARANCE.A,
        backgroundColor: CLEARANCE_COLORS.A,
        pointRadius: 5,
        data: visitorsA,
      },
      {
        label: CLEARANCE.B,
        backgroundColor: CLEARANCE_COLORS.B,
        pointRadius: 5,
        data: visitorsB,
      },
      {
        label: CLEARANCE.C,
        backgroundColor: CLEARANCE_COLORS.C,
        pointRadius: 5,
        data: visitorsC,
      },
      {
        label: CLEARANCE.D,
        pointRadius: 5,
        backgroundColor: CLEARANCE_COLORS.D,
        data: visitorsD,
      },
      {
        label: CLEARANCE.UNKNOWN,
        pointRadius: 5,
        backgroundColor: CLEARANCE_COLORS.UNKNOWN,
        data: visitorsUnknown,
      },
    ],
  };

  // Create components
  let donutComponent = ( <DonutChart graphData={ donutData } graphId="mmmdonut" /> );
  let scatterComponent = ( <ScatterChart graphData={ scatterData } graphId="scatter" clearance={ CLEARANCE } /> );

  // If we do not have any data, replace charts with empty states
  if ( ( counts.A + counts.B + counts.C + counts.D + counts.UNKNOWN ) === 0 ) {
    donutComponent = ( <p className="chart-empty">No information yet.</p> );
    scatterComponent = ( <p className="chart-empty">Visitor log not available.</p> );
  }

  return (
    <div className="stats">
      <Tally counts={ counts } />
      <div className="chart-row">
        <div className="chart chart-donut">
          { donutComponent }
        </div>
        <div className="chart chart-scatter">
          { scatterComponent }
        </div>
      </div>
    </div>
  );
};

Stats.propTypes = {
  logList: PropTypes.arrayOf( PropTypes.shape( {
    name: PropTypes.string,
    clearanceType: PropTypes.string,
    profileImg: PropTypes.string,
    epochTime: PropTypes.number.isRequired,
    time: PropTypes.string.isRequired,
  } ) ),
};

Stats.defaultProps = {
  logList: [],
};

export default Stats;
