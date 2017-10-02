import React from "react";
import PropTypes from "prop-types";
import Button from "components/button/Button";
import "./Something.css";

const Something = ( { active, message, lastTrack, count, countUp, loadTrack, changePage } ) => {
  let classes = "something";
  if ( active ) classes += " active";

  return (
    <div className={ classes }>
      <div className="counter" role="button" tabIndex="0" onClick={ countUp }>{message + count}</div>
      <Button label="About Page" click={ changePage } data={ { url: "/about/parameter-example" } } />
      <Button label="Load Song Name" click={ loadTrack } />
      <h1>{ lastTrack }</h1>
    </div>
  );
};

Something.propTypes = {
  active: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  countUp: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
  loadTrack: PropTypes.func.isRequired,
  lastTrack: PropTypes.string,
};

Something.defaultProps = {
  lastTrack: "",
};

export default Something;
