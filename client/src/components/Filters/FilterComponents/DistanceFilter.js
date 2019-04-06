import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';

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
    }
    toggleCollapse(){
        this.setState({collapse: !this.state.collapse});
    }
    select(i){
        this.setState({selected: i});
        this.state.onChange(this.state);
    }
    rangeSelect(e){
        this.setState({selected: e.target.value, rangeValue:e.target.value});
        this.state.onChange(this.state);
    }
    clearSelected(){
        this.setState({selected: null});
        this.state.onChange(this.state);
    }
  
    render(){
        const { classes } = this.props; 
        return (
            <React.Fragment> 
                <ListItem button onClick={()=>this.toggleCollapse()}>
                    <ListItemIcon>
                        {this.state.icon}
                    </ListItemIcon>
                    <ListItemText inset primary={this.state.text} classes={this.state.selected != null ? classes.selectedHeader : {}}/>
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
                            <Input min={1}
                                defaultValue={this.state.rangeValue}
                                type="range"
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