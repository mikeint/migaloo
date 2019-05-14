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
    textField1Container:{
        display: "flex",
        whiteSpace: "nowrap",
        flex: "1 1"
    },
    textField1:{
        display: "flex",
        minWidth: 300,
        flex: "1 1"
    },
    textField2:{
        width: 400,
    },
    info:{
        marginTop: "16px"
    },
    alignment:{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%"
    },
    secondaryAddress:{
    },
    toolTip:{
        marginRight: "30px"
    }
})
class AddressInput extends Component {

    constructor(props) {
        super(props);
        const formattedAddress = this.formatAddress(props)
		this.state = {
            hasBlur: false,
            address: formattedAddress,
            formattedAddress: formattedAddress,
            onChange: props.onChange,
            addressLine1: props.addressLine1 || '',
            addressLine2: props.addressLine2 || '',
            placeId: props.placeId, // Nullable
            city: props.city || '',
            stateProvince: props.stateProvince || '', 
            stateProvinceCode: props.stateProvinceCode || '', 
            country: props.country || '', 
            countryCode: props.countryCode || '', 
            postalCode: props.postalCode || '', 
            lat: props.lat, // Nullable
            lon: props.lon, // Nullable
            error: false
        };
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
                this.setState({ ...addressData, error: false });
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
        const addr = {
            placeId: result.place_id,
            ...getLatLng(result)
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
        const formattedAddress = this.formatAddress(addr);
        addr.formattedAddress = formattedAddress;
        addr.address = formattedAddress;
        return addr;
    }
    blurredOnce(){
        if(!this.state.hasBlur)
            this.setState({hasBlur: true})
    }
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.error !== nextProps.error
        if(change){
            this.setState({ error: nextProps.error });
        }
        if(this.state !== nextState)
            return true
        return change;
    }
    isValid(){
        return this.state.placeId != null
    }
    render(){  
        const { classes, className } = this.props;
        const inputProps = {
            label: "Address",
            placeholder: "Address",
            margin: "normal",
            variant: "outlined",
            onBlur: this.blurredOnce.bind(this),
            className: `location-search-input ${classes.textField1}`
        }
        if((!this.state.placeId && this.state.hasBlur) || this.state.error){
            inputProps.error = true;
            inputProps.helperText="Please select an item from the drop down"
        }
        return (
            <div className={classes.alignment+" "+className}>
                <PlacesAutocomplete
                    value={this.state.address}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    clearItemsOnError={true}
                    debounce={200}
                    searchOptions={{types: ['address']}}
                >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div className={classes.textField1Container}>
                        <TextField
                            {...getInputProps(inputProps)}
                        />
                        <Tooltip className={classes.toolTip} title="An item must be selected from the drop down search" aria-label="Search">
                            <Info className={classes.info}/>
                        </Tooltip>
                        <Paper className={classes.paper} square>
                            {loading && <MenuItem
                                    {...getSuggestionItemProps}
                                    selected={false}
                                    component="div"
                                    className={classes.textField1}
                                    style={{
                                        fontWeight: 400,
                                    }}>
                                Loading...
                            </MenuItem>}
                            {suggestions.map((suggestion, i) => {
                                const className = classes.textField1;
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
                    label="Address Line 2"
                    placeholder="Address Line 2 (Optional)"
                    defaultValue={this.state.addressLine2}
                    className={classes.textField2+" "+classes.secondaryAddress}
                    onChange={this.handleAddr2Change.bind(this)}
                    margin="normal"
                    variant="outlined"
                />
            </div>
        );
    }
}

export default withStyles(styles)(AddressInput);