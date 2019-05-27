import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {List, ListItem, ListItemIcon, ListItemText, Collapse} from '@material-ui/core';
import {ExpandLess, ExpandMore, Check, Close} from '@material-ui/icons';
  
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
            onChange: props.onChange,
            type: props.type || 'checkbox'
        };
        this.dataFunc = props.dataFunc.bind(this)
        this.clearSelected = this.clearSelected.bind(this)
        if(props.clearSubject != null)
            props.clearSubject.subscribe(this.clearSelected)
    }
    componentDidMount = () => {
        this.dataFunc();
    } 
    toggleCollapse(){
        this.setState({collapse: !this.state.collapse});
    }
    toggleSelected(item){
        let selected = this.state.selected;
        const i = selected.findIndex(d=> d.id === item.id)
        if(i === -1){
            if(this.state.type === 'checkbox'){
                selected.push(item);
            }else if(this.state.type === 'radio'){
                selected = [item];
            }
        }else{
            selected.splice(i, 1)
        }
        this.setState({selected: [...selected]}, ()=>this.state.onChange(this.state));
    }
    clearSelected(){
        this.setState({selected: []}, ()=>this.state.onChange(this.state));
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
                                <ListItemText inset primary={item.name} secondary={item.secname} />
                            </ListItem>
                        )}
                    </List>
                </Collapse>
            </React.Fragment>
        ) 
    }
}
 

export default withStyles(styles)(ListFilter);