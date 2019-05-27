import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {List, ListItem, ListItemIcon, ListItemText, Collapse,
    Input} from '@material-ui/core';
import {ExpandLess, ExpandMore, Close, Check} from '@material-ui/icons';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

const styles = theme => ({
    selectedHeader:{
        fontWeight: "bold"
    }
});
class DistanceFilter extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            id: props.id,
            text: props.text,
            data: [1, 2, 5, 10],
            collapse: props.defaultExpanded || false,
            icon: props.icon,
            selected:null,
            metric: true,
            rangeValue: 50,
            onChange: props.onChange
        };
        this.clearSelected = this.clearSelected.bind(this)
        if(props.clearSubject != null)
            props.clearSubject.subscribe(this.clearSelected)
    }
    toggleCollapse(){
        this.setState({collapse: !this.state.collapse});
    }
    select(i){
        this.setState({selected: i, rangeValue: i}, ()=>this.state.onChange(this.state));
    }
    rangeSelect(e){
        this.setState({selected: e, rangeValue:e}, ()=>this.state.onChange(this.state));
    }
    clearSelected(){
        this.setState({selected: null, rangeValue: 50}, ()=>this.state.onChange(this.state));
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
                            <ListItemText inset primary={`Selected: ${this.state.selected?this.state.selected+(this.state.metric?' km':' mi'):'None'}`} />
                        </ListItem>
                        {this.state.data.map((item, itemIndex) => 
                            <ListItem
                                key={itemIndex}
                                button
                                className={classes.nested}
                                onClick={()=>this.select(item)}>
                                {item.selected && <ListItemIcon><Check /></ListItemIcon>}
                                <ListItemText inset primary={`${item} ${this.state.metric?'km':'mi'}`} />
                            </ListItem>
                        )}
                        <ListItem
                            className={classes.nested}>
                            <Slider
                                min={1}
                                max={100} 
                                tep={1}
                                value={this.state.rangeValue}
                                onChange={this.rangeSelect.bind(this)}
                                />&nbsp;<span>{`${this.state.rangeValue} ${this.state.metric?'km':'mi'}`}</span>
                        </ListItem>
                    </List>
                </Collapse>
            </React.Fragment>
        ) 
    }
}
 

export default withStyles(styles)(DistanceFilter);