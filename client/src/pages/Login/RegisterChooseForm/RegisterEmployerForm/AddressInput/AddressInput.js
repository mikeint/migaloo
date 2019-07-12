import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Info from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from "react";
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';

const styles = theme => ({
    info:{
        marginTop: "16px"
    },
    toolTip:{
        marginRight: "30px"
    },
    textField: {
        width: "100%",
        marginTop: 10
    },
    white: {
        color: "white !important",
        borderBottomColor: "white !important",
        '&:before': {
            color: "white",
            borderBottomColor: "white",
        },
        '&:after': {
            color: "white",
            borderBottomColor: "white",
        },
        '&:hover': {
            color: "white",
            borderBottomColor: "white",
        },
    },
})
class AddressInput extends Component {

    constructor(props) {
        super(props);
        var value = props.value;
        if(value == null)
            value = {};
        const formattedAddress = this.formatAddress(value)
		this.state = {
            hasBlur: false,
            address: formattedAddress,
            formattedAddress: formattedAddress,
            onChange: props.onChange,
            addressId: value.addressId || null,
            addressLine1: value.addressLine1 || '',
            addressLine2: value.addressLine2 || '',
            placeId: value.placeId, // Nullable
            city: value.city || '',
            stateProvince: value.stateProvince || '', 
            stateProvinceCode: value.stateProvinceCode || '', 
            country: value.country || '', 
            countryCode: value.countryCode || '', 
            postalCode: value.postalCode || '', 
            lat: value.lat, // Nullable
            lon: value.lon, // Nullable
            error: false
        };
        this.formatAddress = this.formatAddress.bind(this);
    }
    handleChange = address => {
        this.setState({ address:address, placeId: null });
        this.state.onChange(this.state);
    };
    handleAddr2Change = addressLine2 => {
        const formattedAddress = this.formatAddress({...this.state, addressLine2:addressLine2.target.value})
        this.setState({ 
            address: formattedAddress,
            formattedAddress: formattedAddress,
            addressLine2: addressLine2.target.value
        });
        this.state.onChange(this.state);
    };
  
    handleSelect = address => {
        geocodeByAddress(address)
            .then(results => {
                return this.getAddress(results[0])
            })
            .then(addressData => {
                this.setState({ ...addressData, error: false, addressId: null });
                this.state.onChange(this.state);
            })
            .catch(error => console.error('Error', error));
    };
    joinBy(list, sep){
        return list.filter(d=>d != null && d !== "").join(sep)
    }
    formatAddress(a){
        return this.joinBy([a.addressLine1, a.addressLine2, a.city, this.joinBy([a.stateProvinceCode, a.postalCode], " "), a.countryCode], ", ")
    }
    getAddress(result){
        const addressLine2 = this.state.addressLine2;
        return getLatLng(result).then((latLon)=>{
            const addr = {
                placeId: result.place_id,
                lat:latLon.lat,
                lon:latLon.lng
            };
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
            addr.addressLine2 = addressLine2;
            const formattedAddress = this.formatAddress(addr);
            addr.formattedAddress = formattedAddress;
            addr.address = formattedAddress;
            return addr;
        })
    }
    blurredOnce(){
        if(!this.state.hasBlur)
            this.setState({hasBlur: true})
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(this.state !== nextState)
            return true
        const change = this.state.error !== nextProps.error
        if(change){
            this.setState({ error: nextProps.error });
        }
        if(nextProps.value != null && this.state.placeId !== nextProps.value.placeId){
            const addr = nextProps.value;
            addr.formattedAddress = this.formatAddress(addr);
            addr.address = addr.formattedAddress;
            this.setState(addr);
        }
        return change;
    }
    isValid(){
        return this.state.placeId != null
    }
    render(){  
        const { classes, className } = this.props;
        const inputProps = {
            label: "Address",
            margin: "normal",
            onBlur: this.blurredOnce.bind(this),
            className: `location-search-input ${classes.textField}`
        }
        if((!this.state.placeId && this.state.hasBlur) || this.state.error){
            inputProps.error = true;
            inputProps.helperText="Please select an item from the drop down"
        }
        return (
            <div className={className}>
                <PlacesAutocomplete
                    value={this.state.address}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    clearItemsOnError={true}
                    debounce={200}
                    searchOptions={{types: ['address']}}
                >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div>
                        <TextField
                            {...getInputProps(inputProps)}
                            InputProps={{classes: {root: classes.white}}}
                            InputLabelProps={{ classes: {root:classes.white} }}
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
                    </div>
                )}
                </PlacesAutocomplete>
                <TextField
                    name="addressLine2"
                    label="Address Line 2 (Optional)"
                    defaultValue={this.state.addressLine2}
                    className={classes.textField}
                    InputProps={{classes: {root: classes.white}}}
                    InputLabelProps={{ classes: {root:classes.white} }}
                    onChange={this.handleAddr2Change.bind(this)}
                    margin="normal"
                />
            </div>
        );
    }
}

export default withStyles(styles)(AddressInput);