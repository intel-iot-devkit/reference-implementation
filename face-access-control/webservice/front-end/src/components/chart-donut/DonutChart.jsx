import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import "./DonutChart.css";

const DonutChart = ( { graphId, graphData } ) => {
  const donutOptions = {
    legend: {
      display: false,
      position: "top",
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
  };

  return (
    <div className="graph-pane graph-donut-pane" key={ graphId }>
      <Doughnut data={ graphData } options={ donutOptions }  />
    </div>
  );
};

DonutChart.propTypes = {
  graphId: PropTypes.string.isRequired,
  graphData: PropTypes.shape( {
    labels: PropTypes.array,
    datasets: PropTypes.obj,
    options: PropTypes.obj,
  } ),
};

DonutChart.defaultProps = {
};

export default DonutChart;
