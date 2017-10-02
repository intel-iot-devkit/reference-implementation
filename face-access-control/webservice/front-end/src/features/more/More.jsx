import React from "react";
import PropTypes from "prop-types";
import Button from "components/button/Button";

const More = ( { destroyed, destroy } ) => {
  const classes = "more";

  return (
    <div className={ classes }>
      <Button label="DESTROY!" click={ destroy } />
      {destroyed &&
        <p>AM DESTROYED...</p>
      }
    </div>
  );
};

More.propTypes = {
  destroyed: PropTypes.bool.isRequired,
  destroy: PropTypes.func.isRequired,
};

export default More;
