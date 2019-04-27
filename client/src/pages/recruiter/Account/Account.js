import React from 'react';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import { withStyles } from '@material-ui/core/styles';
import Loader from '../../../components/Loader/Loader';
import Add from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import ContactList from './ContactList/ContactList';
import AddRecruiter from './AddRecruiter/AddRecruiter';

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
            employer: {},
            clickedRecruiter: null
        };
        this.Auth = new AuthFunctions();
    }

    componentWillUnmount = () => {
        ApiCalls.cancel();
    }

    componentDidMount = () => {
        this.getEmployer();
    }

    getEmployer = () => {
        ApiCalls.get('/api/company/recruiter/list')
        .then((res)=>{    
            if(res == null) return
            this.setState({ employer: res.data.employers[0] })
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    openAddRecruiter(){
        this.setState({
            openAddRecruiter: true
        })
    }
    handleAddRecruiterClose(didChange) {
        this.setState({
            openAddRecruiter: false,
            clickedRecruiter: false
        })
        if(didChange){
            this.getRecruiters();
        }
    }

    render(){ 

        const { classes } = this.props; 
        return (
            <React.Fragment>

                <div>
                    <div className="pageHeading">Recruiters
                        <IconButton onClick={()=>this.openAddRecruiter()}><Add/></IconButton>
                    </div> 
                    <ContactList
                        company={this.state.company} />
                </div>
                <Drawer
                    anchor="bottom"
                    open={this.state.openAddRecruiter}
                    onClose={this.handleAddRecruiterClose.bind(this)}
                    >
                    <AddRecruiter
                        onClose={this.handleAddRecruiterClose.bind(this)} />
                </Drawer>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Accounts);
