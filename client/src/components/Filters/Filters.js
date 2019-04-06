import React from 'react';
import './Filters.css'; 

import ApiCalls from '../../ApiCalls';  
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
import AttachMoney from '@material-ui/icons/AttachMoney';
import Gavel from '@material-ui/icons/Gavel';
import Assignment from '@material-ui/icons/Assignment';
import LocationOn from '@material-ui/icons/LocationOn';
import ListFilter from './FilterComponents/ListFilter';
import SearchFilter from './FilterComponents/SearchFilter';
import DistanceFilter from './FilterComponents/DistanceFilter';

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
function experienceDataCall(){
    ApiCalls.get('/api/autocomplete/experience/')
    .then((res) => { 
        if(res && res.data.success) {
            const data = res.data.experienceList
                    .map(d=>{return {name:d.experience_type_name, id: d.experience_type_id}})
                this.setState({data: data});
            }
    })
    .catch(error => {
        console.log(error);
    });
}
function salaryDataCall(){
    ApiCalls.get('/api/autocomplete/salary/')
    .then((res) => { 
        if(res && res.data.success) {
            const data = res.data.salaryList
                    .map(d=>{return {name:d.salary_type_name, id: d.salary_type_id}})

            this.setState({data: data});
        }
    })
    .catch(error => {
        console.log(error);
    });
}
function tagsDataCall(searchString){
    const lowerSearchString = searchString.toLowerCase()
    ApiCalls.get('/api/autocomplete/tag/'+lowerSearchString)
    .then((res) => { 
        if(res && res.data.success) {
            const data = res.data.tagList
                    .map(d=>{return {name:d.tag_name, id: d.tag_id}})
            this.setState({data: data});
        }
    })
    .catch(error => {
        console.log(error);
    })
}

class Filters extends React.Component{

    constructor(props) {
        super(props);
        const filterList = [
            (<ListFilter
                text={"Salary"}
                id={"salary"}
                icon={<AttachMoney />}
                dataFunc={salaryDataCall}
                onChange={this.handleFilterChange} />),
            (<ListFilter
                text={"Experience"}
                id={"experience"}
                icon={<Gavel />}
                dataFunc={experienceDataCall}
                onChange={this.handleFilterChange} />),
            (<SearchFilter
                text={"Tags"}
                id={"tags"}
                icon={<Assignment />}
                dataFunc={tagsDataCall}
                onChange={this.handleFilterChange} />),
            (<DistanceFilter
                text={"Location"}
                id={"location"}
                icon={<LocationOn />}
                onChange={this.handleFilterChange} />)
        ]
		this.state = {
            filterOpen: props.open,
            onClose: props.onClose,
            filterList: filterList,
            filters: {}
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.filterOpen !== nextProps.open;
        if(change){
            this.setState({ filterOpen: nextProps.open });
        }
        if(this.state !== nextState)
            return true
        return change;
    }
    handleFilterChange(event){
        const filters = this.state.filters
        filters[event.id] = event.selected;
        this.setState({ filters: filters });
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
                        <ListItem button key="Clear All Filters">
                            <ListItemIcon><Clear /></ListItemIcon>
                            <ListItemText primary="Clear All Filters" />
                        </ListItem> 
                        <Divider />
                        {this.state.filterList.map((filterOption, filterIndex) => (
                            React.cloneElement(
                                filterOption, 
                                { key: filterIndex }
                            )
                        ))}
                    </List>
                </Drawer>
            </React.Fragment>
        ) 
    }
}
 

export default withStyles(styles)(Filters);