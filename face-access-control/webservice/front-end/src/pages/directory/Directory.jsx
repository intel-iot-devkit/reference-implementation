import React from "react";
import PropTypes from "prop-types";
import ContactDetails from "features/contact-details/ContactDetails";
import ContactAdd from "features/contact-add/ContactAdd";
import ContactEdit from "features/contact-edit/ContactEdit";
import ContactList from "features/contact-list/ContactList";
import mq from "../../MqttClient";
import { SETTINGS, MQTT } from "../../constants/constants";
import "./Directory.css";

class Directory extends React.Component {
  constructor( props ) {
    super( props );
    this.createNewContact = this.createNewContact.bind( this );
    this.toggleEditMode = this.toggleEditMode.bind( this );
    this.selectContact = this.selectContact.bind( this );
    this.saveContact = this.saveContact.bind( this );
    this.cancelAddContact = this.cancelAddContact.bind( this );
    this.handleMqtt = this.handleMqtt.bind( this );

    this.state = {
      viewMode: "view",
      editedValues: [],
      currentContact: {},
      currentContactId: null,
      currentPersonReturned: null,
      contactList: [],
    };
  }

  componentWillMount() {
    this.props.loadAllContacts();
  }

  componentDidMount() {
    // register handler with mqtt client
    mq.addHandler( "register", this.handleMqtt );
  }
  componentWillUnmount() {
    mq.removeHandler( "register" );
  }

  componentWillReceiveProps( nextProps ) {
    if ( this.props.isAddingNewPerson && !nextProps.isAddingNewPerson ) {
      this.props.loadAllContacts();
    }
  } 

  createNewContact() {
    this.setState( { viewMode: "add" } );
    mq.publish( MQTT.TOPICS.REGISTER );
  }

  toggleEditMode() {
    this.setState( { viewMode: "edit" } );
  }

  selectContact( contact ) {
    this.setState( { currentContact: contact } );
  }

  cancelAddContact() {
    this.setState( { viewMode: "view", currentContactId: null } );
  }
  // not currently used
  handleMqtt( topic, payload ) {
    switch ( topic ) {
      case MQTT.TOPICS.REGISTERED:
        this.props.personRegistered( payload.id );
        break;
      default:
        break;
    }
  }
  saveContact( eventData ) {
    event.preventDefault();
    event.stopPropagation();
    const newPerson = { profile: {
      id: this.props.returnedPerson,
      name: eventData.name,
      clearanceType: eventData.clearanceType,
      position: eventData.position,
      age: eventData.age,
      height: eventData.height,
      weight: eventData.weight,
      phone: eventData.phone,
      email: eventData.email,
    } };
    this.props.saveNewContact( newPerson );
    this.setState( { viewMode: "view", currentContactId: null } );
  }

  render() {
    const sortedContacts = this.props.contactList;

    sortedContacts.sort( ( a, b ) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if ( nameA < nameB ) {
        return -1;
      }
      if ( nameA > nameB ) {
        return 1;
      }
      return 0;
    } );

    let contactPane = ( <ContactDetails
      profile={ this.state.currentContact }
      currentId={ this.state.currentContact.id }
      toggleEditMode={ this.toggleEditMode }
      viewMode={ this.state.viewMode }
    /> );

    if ( this.state.viewMode === "edit" ) {
      contactPane = ( <ContactEdit
        profile={ this.state.currentContact }
        currentId={ this.state.currentContact.id }
        toggleEditMode={ this.toggleEditMode }
        viewMode={ this.state.viewMode }
      /> );
    }

    if ( this.state.viewMode === "add" ) {
      contactPane = ( <ContactAdd
        returnedPerson={ this.props.returnedPerson }
        haveRegisteredPerson={ this.props.haveRegisteredPerson }
        saveContact={ this.saveContact }
        cancelAddContact={ this.cancelAddContact }
        viewMode={ this.state.viewMode }
      /> );
    }

    return (
      <div className="page-directory">
        { contactPane }
        <ContactList
          contacts={ sortedContacts }
          selectContact={ this.selectContact }
          createNewContact={ this.createNewContact }
          viewMode={ this.state.viewMode }
        />
      </div>
    );
  }
}

Directory.propTypes = {
  // this provides route info, will cause lint error
  match: PropTypes.object,
  loadAllContacts: PropTypes.func.isRequired,
  saveNewContact: PropTypes.func.isRequired,
  contactList: PropTypes.array,
  haveRegisteredPerson: PropTypes.bool.isRequired,
  returnedPerson: PropTypes.string,
  personRegistered: PropTypes.func.isRequired,
  isAddingNewPerson: PropTypes.bool.isRequired,
};

Directory.defaultProps = {
  match: {},
  contactList: [],
  returnedPerson: null,
};

export default Directory;
