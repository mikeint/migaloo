import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
class ListFilter extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            id: props.id,
            text: props.text,
            data: [],
            collapse: props.defaultExpanded || false,
            icon: props.icon,
            selected:[],
            dataFunc: props.dataFunc,
            onChange: props.onChange
        };
        this.dataFunc = props.dataFunc.bind(this)
        this.dataFunc();
    }
    toggleCollapse(){
        this.setState({collapse: !this.state.collapse});
    }
    toggleSelected(item){
        const selected = this.state.selected;
        const i = selected.findIndex(d=> d.id === item.id)
        if(i === -1){
            selected.push(item)
        }else{
            selected.splice(i, 1)
        }
        this.setState({selected: [...selected]});
        this.state.onChange(this.state);
    }
    clearSelected(){
        this.setState({selected: []});
        this.state.onChange(this.state);
    }
    isSelected(item){
        return this.state.selected.some(d=> d.id === item.id)
    }
  
    render(){
        const { classes } = this.props; 
        return (
            <React.Fragment> 
                <ListItem button onClick={()=>this.toggleCollapse()}>
                    <ListItemIcon>
                        {this.state.icon}
                    </ListItemIcon>
                    <ListItemText inset primary={this.state.text} classes={{primary:this.state.selected.length > 0 ? classes.selectedHeader : ''}} />
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
                            <ListItemText inset primary={"Clear Filter"} />
                        </ListItem>
                        {this.state.data.map((item, itemIndex) => 
                            <ListItem
                                key={itemIndex}
                                button
                                className={classes.nested}
                                onClick={()=>this.toggleSelected(item)}>
                                {this.isSelected(item) && <ListItemIcon><Check /></ListItemIcon>}
                                <ListItemText inset primary={item.name} />
                            </ListItem>
                        )}
                    </List>
                </Collapse>
            </React.Fragment>
        ) 
    }
}
 

export default withStyles(styles)(ListFilter);