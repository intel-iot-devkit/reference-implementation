import React from "react";
import PropTypes from "prop-types";
import FontAwesome from "react-fontawesome";
import Button from "components/button/Button";
import { CLEARANCE } from "../../constants/constants";
import "./ContactDetails.css";

const ContactDetails = ( { active, currentId, profile, toggleEditMode } ) => {
  let classes = "contact-details-container";
  let imageToUse;
  if ( active ) classes += " active";

  if ( profile.id ) {
    imageToUse = `http://localhost:8000/api/facial-recognition/file/profile%2F${ profile.id }.jpg`;
  }

  const clearanceClass = {
    A: ( <span className="clearance-dot clearance-type-a" /> ),
    B: ( <span className="clearance-dot clearance-type-b" /> ),
    C: ( <span className="clearance-dot clearance-type-c" /> ),
    D: ( <span className="clearance-dot clearance-type-d" /> ),
    default: "",
  };
  const clearanceDot = clearanceClass[ profile.clearanceType ] || clearanceClass.default;
  const clearanceLabel = CLEARANCE[ profile.clearanceType ] || "Unknown";

  let details = (
    <div className="known-contact">
      <p className="contact-name">{ profile.name }</p>
      <div className="contact-image"><img src={ imageToUse } alt={ profile.name } /></div>
      <div className="contact-clearance">{ clearanceDot }{ clearanceLabel } Clearance</div>
      <div className="contact-stats">
        <div className="stat-label">Position</div><div className="stat-value">{ profile.position ? profile.position : "No answer" }</div>
        <div className="stat-label">Age</div><div className="stat-value">{ profile.age ? profile.age : "No answer"}</div>
        <div className="stat-label">Height</div><div className="stat-value">{ profile.height ? profile.height : "No answer" }</div>
        <div className="stat-label">Weight</div><div className="stat-value">{ profile.weight ? profile.weight : "No answer" }</div>
        <div className="stat-label">Phone</div><div className="stat-value">{ profile.phone ? profile.phone : "No answer"}</div>
        <div className="stat-label">Email</div><div className="stat-value">{ profile.email ? profile.email : "No answer" }</div>
      </div>
      { /* <Button label="Edit" addClass="active" click={ toggleEditMode } /> */ }
    </div>
  );

  if ( currentId === null || currentId === undefined ) {
    details = (
      <div className="unknown-contact">
        <FontAwesome name="user-circle-o" size="5x" />
        <h4>Directory</h4>
      </div>
    );
  }

  return (
    <div className={ classes } key={ currentId }>
      { details }
    </div>
  );
};

ContactDetails.propTypes = {
  currentId: PropTypes.string,
  active: PropTypes.bool,
  profile: PropTypes.shape( {
    id: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    clearanceType: PropTypes.strin,
    status: PropTypes.string,
    position: PropTypes.string,
    age: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.number ] ),
    height: PropTypes.string,
    weight: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  } ),
  toggleEditMode: PropTypes.func.isRequired,
};

ContactDetails.defaultProps = {
  currentId: null,
  active: true,
  profile: {
    id: "",
    image: "",
    name: "",
    clearanceType: "",
    status: "Allowed",
    position: "",
    age: 0,
    height: "",
    weight: "",
    phone: "",
    email: "",
  },
};
export default ContactDetails;
