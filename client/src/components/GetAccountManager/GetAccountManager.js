import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import React, { Component } from "react";
import {get, getWithParams, post, cancel, getNewAuthToken} from '../../ApiCalls';

const styles = theme => ({
    rightBtn:{
        float: "right",
    },
    chip: {
        marginRight: "5px"
    }
})
class GetAccountManager extends Component {

    constructor(props) {
        super(props);
		this.state = {
            subject: props.subject,
            defaultSearch: '',
            accountManagers: [],
            selected:[]
        };
    }
    componentDidMount = () => {
        this.getAccountManagers('');
    }
    getAccountManagers = (searchString) => {
        const query = searchString!==''?`/api/employer/getAccountManagers/search/${searchString}`:`/api/employer/getAccountManagers`
        get(query)
        .then((res)=>{
            if(res.data && res.data.success){
                const data = res.data.accountManagers.map(d=>{
                    d.id = d.user_id
                    d.name = d.first_name+" "+d.last_name
                    return d;
                })
                this.setState({
                    accountManagers: data
                });
            }
        }).catch(errors => {
            console.log(errors.response)
        })
        this.searchRef = React.createRef();
    }
    handleDialogCancel = () => {
        this.props.onClose();
    };
    handleDialogSelect = () => {
        const selected = this.state.selected;
        this.props.onClose(selected);
        this.setState({selected: []});
    };
    clearSearch(){
        this.searchRef.current.value = '';
        this.setState({defaultSearch: ''},
            ()=>this.getAccountManagers(''));
    }
    isSelected(item){
        return this.state.selected.some(d=> d.id === item.id)
    }
    inputChange(e){
        const search = e.target.value;
        this.setState({defaultSearch: search},
            ()=>this.getAccountManagers(search));
    }
    toggleSelected(item){
        let selected = this.state.selected;
        const i = selected.findIndex(d=> d.id === item.id)
        if(i === -1){
            selected.push(item);
        }else{
            selected.splice(i, 1)
        }
        this.setState({selected: [...selected]});
    }

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog
                        maxWidth="xl"
                        fullWidth={true}
                        onClose={this.handleDialogCancel}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">
                        <span>Pick Account Manager(s){this.state.subject ?  (" - " + this.state.subject) : ''}</span>
                        <IconButton color="inherit" onClick={this.handleDialogCancel} className={classes.rightBtn}>
                            <Close color="primary"/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {this.state.selected.map((sel, i)=>
                            <Chip
                                label={sel.name}
                                key={i}
                                onDelete={(e)=>this.toggleSelected(sel, i)}
                                className={classes.chip}
                                color="secondary"
                            />
                        )}
                        <List component="div" disablePadding>
                            <ListItem
                                divider={true}
                                className={classes.nested}>
                                <ListItemIcon><Search /></ListItemIcon>
                                <Input
                                    placeholder="Account Manager Search"
                                    className={classes.input}
                                    defaultValue={this.state.defaultSearch}
                                    inputRef={this.searchRef}
                                    inputProps={{
                                        'aria-label': 'Account Manager Search',
                                    }}
                                    endAdornment={
                                        <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Clear Search"
                                            onClick={this.clearSearch.bind(this)}
                                        >
                                            <Close />
                                        </IconButton>
                                        </InputAdornment>
                                    }
                                    onChange={this.inputChange.bind(this)}
                                />
                            </ListItem>
                            {this.state.accountManagers.map((item, itemIndex) => 
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
                        <Button 
                        color="primary"
                        variant="contained"
                        onClick={this.handleDialogSelect.bind(this)}>Select</Button> 
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(GetAccountManager);