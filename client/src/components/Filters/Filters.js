import React from 'react';
import './Filters.css'; 

import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Clear from '@material-ui/icons/Clear';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography'; 
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import FilterList from '@material-ui/icons/FilterList'; 
  
const styles = theme => ({
    drawer: {
      minWidth: "200px",
      flexShrink: 0,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    drawerReturnBtn: {
      marginLeft:"auto"
    },
});
class Filters extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            filterOpen: props.open,
            onClose: props.onClose
        };
    }
    shouldComponentUpdate(nextProps) {
        const change = this.state.filterOpen !== nextProps.open;
        if(change){
            this.setState({ filterOpen: nextProps.open });
        }
        return change;
    }
   
    handleDrawerToggle = () => {
        if(!this.state.filterOpen)
            this.state.onClose();
        this.setState({ filterOpen: !this.state.filterOpen });
    };
    
    handleDrawerClose = () => {
        this.state.onClose();
        this.setState({ filterOpen: false });
    };
    render(){
        const { classes } = this.props; 
        return (
            <React.Fragment> 
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={this.state.filterOpen}
                    >
                    <div className={classes.drawerHeader}>
                        <Typography variant="h6" color="inherit" noWrap>
                            <FilterList/>&nbsp;Filter
                        </Typography>
                        <IconButton className={classes.drawerReturnBtn} onClick={this.handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <ListItem button key="Clear Filters">
                            <ListItemIcon><Clear /></ListItemIcon>
                            <ListItemText primary="Clear Filters" />
                        </ListItem>
                        <Divider />
                        {['Salary', 'Experience', 'Tags'].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon><ChevronLeftIcon /></ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                        ))}
                    </List>
                </Drawer>
            </React.Fragment>
        ) 
    }
}
 

export default withStyles(styles)(Filters);