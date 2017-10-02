import React from "react";
import PropTypes from "prop-types";
import Button from "components/button/Button";
import "./ContactEdit.css";

const ContactEdit = ( { active, currentId, profile, editContact } ) => {
  let classes = "contact-edit-container";
  let imageToUse;
  if ( active ) classes += " active";

  if ( !profile.image ) {
    imageToUse = "http://placekitten.com/500/500";
  } else {
    imageToUse = profile.image;
  }

  return (
    <div className={ classes } key={ currentId }>
      <p>This is the Contact Edit Component. Editing coming soon.</p>
    </div>
  );
};

ContactEdit.propTypes = {
  currentId: PropTypes.string.isRequired,
  active: PropTypes.bool,
  profile: PropTypes.shape( {
    id: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    clearanceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    height: PropTypes.string.isRequired,
    weight: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  } ),
  toggleEditMode: PropTypes.func.isRequired,
  saveContact: PropTypes.func.isRequired,  
};

ContactEdit.defaultProps = {
  active: true,
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
export default ContactEdit;
