import React from 'react';
import ApiCalls from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import ContactList from './ContactList/ContactList';

const styles = theme => ({
});

class Account extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            company: null
        };
    }

    componentWillUnmount = () => {
        ApiCalls.cancel();
    }

    componentDidMount = () => {
        this.getCompany();
    }

    getCompany = () => {
        ApiCalls.get('/api/company/list')
        .then((res)=>{    
            if(res == null) return
            this.setState({ company: res.data.companies[0] })
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }

    render(){ 

        // const { classes } = this.props; 
        return (
            <React.Fragment>
                {this.state.company != null && <ContactList
                    company={this.state.company} />}
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(Account);
