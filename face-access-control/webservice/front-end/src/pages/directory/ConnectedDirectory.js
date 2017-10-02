import { connect } from "react-redux";
import { push } from "react-router-redux";
import { loadContact, loadAllContacts, saveNewContact, personRegistered } from "dux/directory";
import Directory from "./Directory";

// maps the redux state to this components props
const mapStateToProps = state => ( {
  currentId: state.directory.currentContactId,
  active: state.directory.active,
  currentProfile: state.directory.currentContact,
  contactList: state.directory.contactList,
  returnedPerson: state.directory.returnedPerson,
  haveRegisteredPerson: state.directory.haveRegisteredPerson,
  isAddingNewPerson: state.directory.isAddingNewPerson,
} );

// provide the component with the dispatch method
const mapDispatchToProps = dispatch => ( {
  loadContact: ( currentId ) => {
    dispatch( loadContact( currentId ) );
  },
  loadAllContacts: () => {
    dispatch( loadAllContacts() );
  },
  saveNewContact: ( newPerson ) => {
    dispatch( saveNewContact( newPerson ) );
  },
  personRegistered: ( id ) => {
    dispatch( personRegistered( id ) );
  },
} );

export default connect( mapStateToProps, mapDispatchToProps )( Directory );