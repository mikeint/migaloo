import React from 'react';
import {get, getWithParams, post, cancel, getNewAuthToken} from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import { withStyles } from '@material-ui/core/styles';
import Loader from '../../../components/Loader/Loader';
import Add from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import ContactList from './ContactList/ContactList';
import AddCompany from './AddCompany/AddCompany';

const styles = theme => ({
    createdTime:{ 
        fontSize: '12px',
        marginLeft: 'auto',
        marginTop: '15px'
    },
    isPrimary:{ 
        marginLeft: 'auto'
    },
    isPrimaryBox:{
        color: theme.palette.secondary.main,
        border: "1px solid",
        borderColor: theme.palette.secondary.main,
        padding: "4px 10px"
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
            companyList: [],
            openContact: false,
            openAddCompany: false,
            clickedCompany: null
        };
        this.Auth = new AuthFunctions();
    }

    componentWillUnmount = () => {
        cancel();
    }

    componentDidMount = () => {
        this.getCompanys();
    }

    getCompanys = () => {
        get('/api/company/list')
        .then((res)=>{    
            if(res == null) return
            this.setState({ companyList: res.data.companies })
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    openContactList(company){
        this.setState({
            openContact: true,
            clickedCompany:company
        })
    }
    handleContactsClose(didChange) {
        this.setState({
            openContact: false
        })
        if(didChange){
            this.getCompanys();
        }
    }
    openAddCompany(){
        this.setState({
            openAddCompany: true
        })
    }
    handleAddCompanyClose(didChange) {
        this.setState({
            openAddCompany: false,
            clickedCompany: false
        })
        if(didChange){
            this.getCompanys();
        }
    }

    render(){ 

        const { classes } = this.props; 
        return (
            <React.Fragment>

                <div>
                    <div className="pageHeading">Companys
                    <IconButton onClick={()=>this.openAddCompany()}><Add/></IconButton>
                    </div> 
                    {
                        this.state.companyList ?
                            <div>
                                {
                                    this.state.companyList.map((item, i) => {
                                        return <Button key={i} className={classes.row} onClick={()=>this.openContactList(item)}>
                                            {item.company_name}
                                            <span className={classes.createdTime}>{item.created}</span>
                                            <span className={classes.isPrimary}>{item.is_primary && <div className={classes.isPrimaryBox}>Primary</div>}</span>
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
                        company={this.state.clickedCompany}
                        onClose={this.handleContactsClose.bind(this)} />
                </Drawer>
                <Drawer
                    anchor="bottom"
                    open={this.state.openAddCompany}
                    onClose={this.handleAddCompanyClose.bind(this)}
                    >
                    <AddCompany
                        onClose={this.handleAddCompanyClose.bind(this)} />
                </Drawer>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Accounts);
