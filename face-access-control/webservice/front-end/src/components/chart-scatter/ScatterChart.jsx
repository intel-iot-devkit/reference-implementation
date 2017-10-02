import React from "react";
import PropTypes from "prop-types";
import { Scatter } from "react-chartjs-2";
import { CLEARANCE } from "../../constants/constants";

const ScatterChart = ( { graphId, graphData, clearance  } ) => {
  const scatterOptions = {
    legend: {
      display: false,
      position: "top",
    },
    showLines: false,
    scales: {
      yAxes: [ {
        gridLines: {
          display: true,
        },
        scaleLabel: {
          display: true,
        },
        ticks: {
          suggestedMin: 0,
          beginAtZero: true,
          display: true,
          fontFamily: "'Intel Clear', Arial, sans-serif",
          max: 6,
          min: 0,
          stepSize: 1,
          callback: function(label, index, labels) {
            switch (label) {
                case 0:
                    return '';
                case 1:
                    return clearance.UNKNOWN;
                case 2:
                    return clearance.D;
                case 3:
                    return clearance.C;
                case 4:
                    return clearance.B;
                case 5:
                    return clearance.A;
                case 6:
                    return '';
            }
          }          
        },
      } ],
      xAxes: [ {
        gridLines: {
          display: false,
        },
        scaleLabel: {
          display: true,
          labelString: "Time",
          fontFamily: "'Intel Clear', Arial, sans-serif",
          fontSize: "16",
        },
        ticks: {
          display: false,
        }
      } ],
    },
    tooltips: {
      enabled: false,
    },
    data: {
      labels: [ null, CLEARANCE.UNKNOWN, CLEARANCE.D, CLEARANCE.C, CLEARANCE.B, CLEARANCE.A, null ],
    },
  };

  return (
    <div className="graph-pane" key={ graphId }>
      <Scatter data={ graphData } options={ scatterOptions } />
    </div>
  );
};

ScatterChart.propTypes = {
  graphId: PropTypes.string,
  graphData: PropTypes.shape( {
    labels: PropTypes.array,
    datasets: PropTypes.obj,
    options: PropTypes.obj,
  } ),
  clearance: PropTypes.shape( {
    A: PropTypes.string,
    B: PropTypes.string,
    C: PropTypes.string,
    D: PropTypes.string,
    UNKNOWN: PropTypes.string,
  } ),
};

ScatterChart.defaultProps = {
  graphId: "scatter",
  graphData: {},
  clearance: {},
};

export default ScatterChart;
