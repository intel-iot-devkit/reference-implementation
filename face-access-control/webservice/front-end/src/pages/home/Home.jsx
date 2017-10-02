import React from "react";
import PropTypes from "prop-types";
import ConnectedSomething from "features/something/ConnectedSomething";
import "./Home.css";

const Home = ( { propExample } ) => (
  <div className="page-home">
    <h1>{propExample}</h1>
    <ConnectedSomething />
  </div>
);

Home.propTypes = {
  propExample: PropTypes.string,
  // this provides route info, will cause lint error
  match: PropTypes.object,
};

Home.defaultProps = {
  propExample: "Hello World",
  match: {},
};

export default Home;
