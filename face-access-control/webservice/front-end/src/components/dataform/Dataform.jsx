import React from "react";
import PropTypes from "prop-types";
import Button from "components/button/Button";
import { CLEARANCE } from "../../constants/constants";

class DataForm extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      name: "",
      clearanceType: "",
      position: "",
      age: "",
      height: "",
      weight: "",
      phone: "",
      email: "",
      disableSave: true,
    };

    this.handleChange = this.handleChange.bind( this );
  }

  handleChange( event ) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState( {
      [ name ]: value,
    } );

    if ( this.state.name !== "" ) {
      this.setState( { disableSave: false } );
    }
  }

  render() {
    let bodyClasses = "form-body hide-form"; // CHANGE THIS TO "hide-form" WHEN FORM IS INTEGRATED

    if ( this.props.returnedPerson !== null && this.props.returnedPerson !== undefined ) {
      bodyClasses = "form-body";
    }

    return (
      <form name="addContact">
        <div className={ bodyClasses }>
          <label htmlFor="name">Name*</label>
          <input type="text" name="name" onChange={ this.handleChange } placeholder="Name (required)" />
          <label htmlFor="clearanceType">Clearance</label>
          <select name="clearanceType" value={ this.state.clearanceType } onChange={ this.handleChange }>
            <option value="A">{ CLEARANCE.A }</option>
            <option value="B">{ CLEARANCE.B }</option>
            <option value="C">{ CLEARANCE.C }</option>
            <option value="D">{ CLEARANCE.D }</option>
          </select>
          { /*<label htmlFor="status">Status</label>
          <select name="status">
            <option value="Classified">Allowed</option>
            <option value="Most Secret">Allowed with Escort</option>
            <option value="Top Secret">Not Allowed</option>
          </select> */}
          <label htmlFor="position">Position</label>
          <input type="text" name="position" value={ this.state.position } placeholder="job title" onChange={ this.handleChange } />
          <label htmlFor="age">Age</label>
          <input type="text" name="age" value={ this.state.age } placeholder="age" onChange={ this.handleChange } />
          <label htmlFor="height">Height</label>
          <input type="text" name="height" value={ this.state.height } placeholder="height" onChange={ this.handleChange } />
          <label htmlFor="weight">Weight</label>
          <input type="text" name="weight" value={ this.state.weight } placeholder="weight" onChange={ this.handleChange } />
          <label htmlFor="phone">Phone Number</label>
          <input type="text" name="phone" value={ this.state.phone } placeholder="e.g. 555 555 5555" onChange={ this.handleChange } />
          <label htmlFor="email">Email</label>
          <input type="email" name="email" value={ this.state.email } placeholder="user@example.com" onChange={ this.handleChange } />
        </div>
        <div className="form-footer">
          <Button label="Cancel" type="button" addClass="btn-cancel" click={ this.props.cancelAddContact } />
          <Button label="Add" type="button" addClass="btn-add" click={ this.props.saveContact } disabled={ this.state.disableSave } data={ this.state } />
        </div>
      </form>
    );
  }
}

DataForm.propTypes = {
  returnedPerson: PropTypes.string,
  cancelAddContact: PropTypes.func.isRequired,
  saveContact: PropTypes.func.isRequired,
};

DataForm.defaultProps = {
  returnedPerson: null,
};

export default DataForm;
