import React from 'react';
import {List, ListItem, ListItemIcon, ListItemText, Collapse} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import {ExpandLess, ExpandMore, Close} from '@material-ui/icons';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

const styles = theme => ({
    selectedHeader:{
        fontWeight: "bold"
    },
    sliderContainer:{
        padding: 20
    },
});
class RangeFilter extends React.Component{

    constructor(props) {
        super(props);
        if(props.min == null || props.max == null || props.step == null){
            throw new Error("Missing Required field in range filter")
        }
		this.state = {
            min: props.min,
            max: props.max,
            step: props.step,
            id: props.id,
            text: props.text,
            collapse: props.defaultExpanded || false,
            icon: props.icon,
            selected:null,
            onChange: props.onChange,
            endAdornment: props.endAdornment
        };
        this.clearSelected = this.clearSelected.bind(this)
        if(props.clearSubject != null)
            props.clearSubject.subscribe(this.clearSelected)
    }
    componentDidMount = () => {

    } 
    toggleCollapse(){
        this.setState({collapse: !this.state.collapse});
    }
    handleChange(value){
        this.setState({selected: value}, ()=>this.state.onChange(this.state));
    }
    clearSelected(){
        this.setState({selected: null}, ()=>this.state.onChange(this.state));
    }
  
    render(){
        const { classes } = this.props; 
        return (
            <React.Fragment> 
                <ListItem button onClick={()=>this.toggleCollapse()}>
                    <ListItemIcon>
                        {this.state.icon}
                    </ListItemIcon>
                    <ListItemText inset primary={this.state.text} classes={{primary:this.state.selected != null ? classes.selectedHeader : ''}} />
                    {this.state.collapse ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={this.state.collapse} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem
                            button
                            divider={true} dense={true}
                            className={classes.nested}
                            onClick={()=>this.clearSelected()}>
                            <ListItemIcon><Close /></ListItemIcon>
                            <ListItemText inset primary={`Selected: ${this.state.selected != null ? this.state.selected.join(' - ')+this.state.endAdornment: 'None'}`} />
                        </ListItem>
                        <div className={classes.sliderContainer}>
                            <Range
                                pushable={this.state.step}
                                count={1}
                                value={this.state.selected != null ? this.state.selected : [0, this.state.max]}
                                min={this.state.min}
                                max={this.state.max}
                                step={this.state.step}
                                onChange={this.handleChange.bind(this)}
                            />
                        </div>
                    </List>
                </Collapse>
            </React.Fragment>
        ) 
    }
}
 

export default withStyles(styles)(RangeFilter);