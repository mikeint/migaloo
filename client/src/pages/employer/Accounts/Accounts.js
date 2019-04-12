import React from 'react';
import './Accounts.css';    
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import { withStyles } from '@material-ui/core/styles';
import Loader from '../../../components/Loader/Loader';
import Add from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import ContactList from './ContactList/ContactList';
import AddEmployer from './AddEmployer/AddEmployer';

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
    openContactList(employer){
        this.setState({
            openContact: true,
            clickedEmployer:employer
        })
    }
    handleContactsClose(didChange) {
        this.setState({
            openContact: false
        })
        if(didChange){
            this.getEmployers();
        }
    }
    openAddEmployer(){
        this.setState({
            openAddEmployer: true
        })
    }
    handleAddEmployerClose(didChange) {
        this.setState({
            openAddEmployer: false,
            clickedEmployer: false
        })
        if(didChange){
            this.getEmployers();
        }
    }

    render(){ 

        const { classes } = this.props; 
        return (
            <React.Fragment>

                <div>
                    <div className="pageHeading">Employers
                    <IconButton onClick={()=>this.openAddEmployer()}><Add/></IconButton>
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
                    onClose={this.handleContactsClose.bind(this)}
                    >
                    <ContactList
                        employer={this.state.clickedEmployer}
                        onClose={this.handleContactsClose.bind(this)} />
                </Drawer>
                <Drawer
                    anchor="bottom"
                    open={this.state.openAddEmployer}
                    onClose={this.handleAddEmployerClose.bind(this)}
                    >
                    <AddEmployer
                        onClose={this.handleAddEmployerClose.bind(this)} />
                </Drawer>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Accounts);
