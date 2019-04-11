import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from "react";
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';

const styles = theme => ({
    textField:{
        width: 400,
    }
})
class AddressInput extends Component {

    constructor(props) {
        super(props);
		this.state = {
            address: ''
        };
    }
    handleChange = address => {
        this.setState({ address });
    };
    handleAddr2Change = addressLine2 => {
        this.setState({ addressLine2: addressLine2 });
    };
  
    handleSelect = address => {
        geocodeByAddress(address)
            .then(results => {
                return this.getAddress(results[0])
            })
            .then(addressData => this.setState({ ...addressData }))
            .catch(error => console.error('Error', error));
    };
    joinBy(list, sep){
        return list.filter(d=>d != null).join(sep)
    }
    formatAddress(a){
        return this.joinBy([a.addressLine1, a.city, this.joinBy([a.stateProvinceCode, a.postalCode], " "), a.countryCode], ", ")
    }
    getAddress(result){
        const addr = {
            placeId: result.place_id,
            ...getLatLng(result)
        };
        const formattedAddress = this.formatAddress(addr);
        addr.formattedAddress = formattedAddress;
        addr.address = formattedAddress;
        result.address_components.forEach(c=>{
            if(c.types.includes("street_number")){
                addr.addressLine1 = c.long_name;
            }
            else if(c.types.includes("route")){
                if(addr.addressLine1)
                    addr.addressLine1 = addr.addressLine1 + " " + c.short_name;
                else
                    addr.addressLine1 = c.short_name;
            }
            else if(c.types.includes("political")){
                if(c.types.includes("locality")){
                    addr.city = c.long_name
                }
                else if(c.types.includes("administrative_area_level_1")){
                    addr.stateProvince = c.long_name
                    addr.stateProvinceCode = c.short_name
                }
                else if(c.types.includes("country")){
                    addr.country = c.long_name
                    addr.countryCode = c.short_name
                }
                else if(c.types.includes("postal_code")){
                    addr.postalCode = c.long_name
                }
            }
        })
        return addr;
    }
    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <PlacesAutocomplete
                    value={this.state.address}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    clearItemsOnError={true}
                    debounce={200}
                    searchOptions={{types: ['address']}}
                >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <React.Fragment>
                        <TextField
                            {...getInputProps({
                                label: "Address",
                                placeholder: "Address",
                                margin: "normal",
                                variant: "outlined",
                                className: `location-search-input ${classes.textField}`,
                            })}
                        />
                        <Paper className={classes.paper} square>
                            {loading && <MenuItem
                                    {...getSuggestionItemProps}
                                    selected={false}
                                    component="div"
                                    className={classes.textField}
                                    style={{
                                        fontWeight: 400,
                                    }}>
                                Loading...
                            </MenuItem>}
                            {suggestions.map((suggestion, i) => {
                                const className = classes.textField;
                                // inline style for demonstration purpose
                                const style = {
                                    fontWeight: suggestion.active ? 500 : 400,
                                };
                                return <MenuItem
                                    {...getSuggestionItemProps(suggestion, {
                                        className,
                                        style,
                                    })}
                                    selected={suggestion.active}
                                    component="div"
                                >
                                    {suggestion.description}
                                </MenuItem>
                            })}
                        </Paper>
                    </React.Fragment>
                )}
                </PlacesAutocomplete>
                <TextField
                    name="addressLine2"
                    label="Address Line 2"
                    placeholder="Address Line 2 (Optional)"
                    className={classes.textField}
                    onChange={this.handleAddr2Change}
                    margin="normal"
                    variant="outlined"
                />
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(AddressInput);