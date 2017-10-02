import React from "react";
import PropTypes from "prop-types";
import Dataform from "components/dataform/Dataform";
import "./ContactAdd.css";
import { HTTP } from "../../constants/constants";

const ContactAdd = ( {
  currentId,
  returnedPerson,
  haveRegisteredPerson,
  cancelAddContact,
  saveContact,
  } ) => {
  let classes = "contact-add-container";

  if ( haveRegisteredPerson ) {
    classes += " active";
  }

  return (
    <div className={ classes } key={ currentId }>
      <div className="contact-image-capture">
        <h2>Create a new profile</h2>
        <img src={ HTTP.CAMERA_FEED } alt="camera feed" className="image-capture" />
      </div>
      <div className="contact-detail-form">
        <h2>Personal Information</h2>
        <Dataform
          active={ haveRegisteredPerson }
          returnedPerson={ returnedPerson }
          cancelAddContact={ cancelAddContact }
          saveContact={ saveContact }
        />
      </div>
    </div>
  );
};

ContactAdd.propTypes = {
  currentId: PropTypes.string,
  haveRegisteredPerson: PropTypes.bool.isRequired,
  returnedPerson: PropTypes.string,
  cancelAddContact: PropTypes.func.isRequired,
  saveContact: PropTypes.func.isRequired,
};

ContactAdd.defaultProps = {
  active: true,
  currentId: null,
  returnedPerson: null,
  profile: {
    id: "",
    image: "",
    name: "",
    clearanceType: "",
    status: "",
    position: "",
    age: 0,
    height: "",
    weight: "",
    phone: "",
    email: "",
  },
};
export default ContactAdd;
