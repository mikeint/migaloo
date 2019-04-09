import React from 'react';
import './Accounts.css';    
import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import { withStyles } from '@material-ui/core/styles';
import Loader from '../../../components/Loader/Loader';
import Add from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import ContactList from './ContactList/ContactList';

const styles = theme => ({
    createdTime:{ 
        fontSize: '12px',
        marginLeft: 'auto',
        marginTop: '15px'
    },
    row:{
        padding: '10px 10px',
        fontSize: '15px',
        background: '#fff',
        color: '#263c54',
        width: '100%'
    }
});

class Accounts extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            employerList: [],
            openContact: false,
            openAddEmployer: false,
            clickedEmployer: null
        };
        this.Auth = new AuthFunctions();

    }

    componentWillUnmount = () => {
        ApiCalls.cancel();
    }

    componentDidMount = () => {
        this.getEmployers();
    }

    getEmployers = () => {
        ApiCalls.get('/api/employer/listEmployers')
        .then((res)=>{    
            if(res == null) return
            this.setState({ employerList: res.data.employers })
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    toggleDrawer = (side, open) => () => {
      this.setState({
        [side]: open,
      });
    };
    openContactList(employer){
        console.log(employer)
        this.setState({
            openContact: true,
            clickedEmployer:employer
        })
    }

    render(){ 

        const { classes } = this.props; 
        return (
            <React.Fragment>

                <div>
                    <div className="pageHeading">Employers
                    <NavLink to="/accountManager/addEmployer"><IconButton><Add/></IconButton></NavLink>
                    </div> 
                    {
                        this.state.employerList ?
                            <div>
                                {
                                    this.state.employerList.map((item, i) => {
                                        return <Button key={i} className={classes.row} onClick={()=>this.openContactList(item)}>
                                            {item.company_name}
                                            <span className={classes.createdTime}>{item.created}</span>
                                        </Button>
                                    })
                                }
                            </div>
                        :
                        <Loader />
                    } 
                </div> 
                <Drawer
                    anchor="bottom"
                    open={this.state.openContact}
                    onClose={this.toggleDrawer('openContact', false)}
                    >
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={this.toggleDrawer('openContact', false)}
                        onKeyDown={this.toggleDrawer('openContact', false)}
                    >
                        <ContactList employer={this.state.clickedEmployer} />
                    </div>
                </Drawer>
                <Drawer
                    anchor="bottom"
                    open={this.state.openAddEmployer}
                    onClose={this.toggleDrawer('openAddEmployer', false)}
                    >
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={this.toggleDrawer('openAddEmployer', false)}
                        onKeyDown={this.toggleDrawer('openAddEmployer', false)}
                    >
                        <ContactList/>
                    </div>
                </Drawer>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Accounts);
