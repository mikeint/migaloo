import React from 'react';

import {get} from '../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import ListFilter from './FilterComponents/ListFilter';
import SearchFilter from './FilterComponents/SearchFilter';
import DistanceFilter from './FilterComponents/DistanceFilter';
import RangeFilter from './FilterComponents/RangeFilter';
import { Subject } from 'rxjs';
import debounce from 'lodash/debounce';
import {List, ListItem, ListItemIcon, ListItemText, Typography,
    Drawer, IconButton, Divider} from '@material-ui/core';
import {AttachMoney, Business, Gavel, FilterList, Assignment,
    LocationOn, ImportContacts, Clear, ChevronLeft} from '@material-ui/icons';

const clearFilterSubject = new Subject();

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
function tagsDataCall(searchString){
    const lowerSearchString = searchString.toLowerCase()
    get('/api/autocomplete/tag/'+lowerSearchString)
    .then((res) => { 
        if(res && res.data.success) {
            const data = res.data.tagList
                    .map(d=>{return {name:d.tagName, id: d.tagId, secname:d.tagTypeName}})
            this.setState({data: data});
        }
    })
    .catch(error => {
        console.log(error);
    })
}
function employerDataCall(){
    get('/api/company/list')
    .then((res) => {
        if(res && res.data.success) {
            const data = res.data.companies
                    .map(d=>{return {name:d.companyName, id:d.companyId}})
            this.setState({data: data});
        }
    })
    .catch(error => {
        console.log(error);
    });
}
function contactTypeDataCall(){
    this.setState({data: [
        {id:true, name:"Primary"},
        {id:false, name:"Secondary"}
    ]});
}

class Filters extends React.Component{

    constructor(props) {
        super(props);
        this.handleFilterRangeChange = this.handleFilterRangeChange.bind(this)
        this.handleFilterChangeWithIds = this.handleFilterChangeWithIds.bind(this)
        var filterList = [
            (<RangeFilter
                text={"Salary"}
                id={"salary"}
                icon={<AttachMoney />}
                step={5}
                min={0}
                max={350}
                endAdornment={'k'}
                onChange={this.handleFilterRangeChange}
                clearSubject={clearFilterSubject.asObservable()} />),
            (<ListFilter
                text={"Employer"}
                id={"employer"}
                icon={<Business />}
                type={"radio"}
                dataFunc={employerDataCall}
                onChange={this.handleFilterChangeWithIds}
                clearSubject={clearFilterSubject.asObservable()} />),
            (<ListFilter
                text={"Contact Type"}
                id={"contactType"}
                icon={<ImportContacts />}
                type={"radio"}
                dataFunc={contactTypeDataCall}
                onChange={this.handleFilterChangeWithIds}
                clearSubject={clearFilterSubject.asObservable()} />),
            (<RangeFilter
                text={"Experience"}
                id={"experience"}
                icon={<Gavel />}
                step={1}
                min={0}
                max={65}
                endAdornment={' years'}
                onChange={this.handleFilterRangeChange}
                clearSubject={clearFilterSubject.asObservable()} />),
            (<SearchFilter
                text={"Tags"}
                id={"tags"}
                icon={<Assignment />}
                dataFunc={tagsDataCall}
                onChange={this.handleFilterChangeWithIds}
                clearSubject={clearFilterSubject.asObservable()} />),
            (<DistanceFilter
                text={"Location"}
                id={"location"}
                icon={<LocationOn />}
                onChange={this.handleFilterRangeChange}
                clearSubject={clearFilterSubject.asObservable()} />)
        ]
        if(props.filterOptions)
            filterList = filterList.filter(d=>props.filterOptions.includes(d.props.id))
		this.state = {
            filterOpen: props.open,
            onClose: props.onClose,
            filterList: filterList,
            filters: {},
            onChange: props.onChange
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state !== nextState)
            return true
        const change = this.state.filterOpen !== nextProps.open;
        if(change){
            this.setState({ filterOpen: nextProps.open });
        }
        return change;
    }
    onChange = debounce(()=>{
        if(this.state.onChange != null)
            this.state.onChange(this.state.filters)
    }, 300)
    handleFilterChangeWithIds(event){
        const filters = this.state.filters;
        filters[event.id] = event.selected.map(d=>d.id);
        this.setState({ filters: filters }, ()=>this.onChange());
    }
    handleFilterRangeChange(event){
        const filters = this.state.filters;
        filters[event.id+'1'] = event.selected == null ? null : event.selected[0];
        filters[event.id+'2'] = event.selected == null ? null : event.selected[1];
        this.setState({ filters: filters }, ()=>this.onChange());
    }
    handleDrawerToggle = () => {
        if(!this.state.filterOpen)
            this.state.onClose(this.state.filters);
        this.setState({ filterOpen: !this.state.filterOpen });
    };
    
    handleDrawerClose = () => {
        this.state.onClose(this.state.filters);
        this.setState({ filterOpen: false });
    };
    clearAllFilters(){
        clearFilterSubject.next();
    }
  
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
                            <ChevronLeft />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <ListItem button key="Clear All Filters"
                                onClick={this.clearAllFilters.bind(this)}>
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