import React from "react";
import PropTypes from "prop-types";
import Button from "components/button/Button";
import "./ContactList.css";

const ContactList = ( { contacts, viewMode, selectContact, createNewContact } ) => {
  const classes = "contact-list-container";
  let disableButtons = false;
  if ( viewMode === "add" || viewMode === "edit" ) {
    disableButtons = true;
  }

  let emptyState = null;
  if (contacts && contacts.length < 1) {
    emptyState = (<p className="contacts-empty">No contacts registered</p>)
  }


  return (
    <div className={ classes }>
      <Button label="New Profile" addClass="plus" click={ createNewContact } disabled={ disableButtons } />
      { emptyState }
      { contacts.map( ( contact ) => {
        return (
          <div className="contact-item" key={ contact.id } ><Button label={ contact.name } addClass="btn-contact" data={ contact } click={ selectContact } disabled={ disableButtons } /></div>
        );
      } ) }
    </div>
  );
};

ContactList.propTypes = {
  contacts: PropTypes.arrayOf( PropTypes.shape( {
    id: PropTypes.string.isRequired,
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
    clearanceType: PropTypes.string.isRequired,
    status: PropTypes.string,
    position: PropTypes.string.isRequired,
    age: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.number ] ).isRequired,
    height: PropTypes.string.isRequired,
    weight: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  } ) ).isRequired,
  viewMode: PropTypes.string.isRequired,
  createNewContact: PropTypes.func.isRequired,
  selectContact: PropTypes.func.isRequired,
};

ContactList.defaultProps = {
};

export default ContactList;
