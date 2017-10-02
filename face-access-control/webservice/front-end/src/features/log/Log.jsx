import React from "react";
import PropTypes from "prop-types";
import "./Log.css";
import FontAwesome from "react-fontawesome";

const Log = ( { logList, logOn } ) => {
  const completeList = logList.map( ( item, index ) => {
    if ( item.profileImg ) {
      return (
          <div className="log-item" key={ index } >
            <img alt="profile pic" className="profile-img" src={ item.profileImg } />
            <div className="time-name">
              <div className="time">{ item.time }</div>
              <div className="name">{ item.name }</div>
            </div>
            <FontAwesome className="check" name="check" size="4x" />
          </div>
      );
    }
  } ).reduce( ( ary, ele ) => {
    ary.unshift( ele );
    return ary;
  }, [] );

  return (
    <div className={ `Log ${ logOn ? "active" : "" }` }>
      { completeList }
    </div>
  );
};
Log.propTypes = {
  logList: PropTypes.array,
  logOn: PropTypes.bool.isRequired,
};

Log.defaultProps = {
  logList: [],
};

export default Log;
