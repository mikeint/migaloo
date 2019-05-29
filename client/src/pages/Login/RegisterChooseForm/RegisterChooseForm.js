import React, { Component } from 'react';   
import RegisterEmployerForm from './RegisterEmployerForm/RegisterEmployerForm';
import RegisterRecruiterForm from './RegisterRecruiterForm/RegisterRecruiterForm';
import {Button, Fab} from '@material-ui/core';
import {Person, Business, ChevronLeft} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';  
import Whale from '../../../components/Whale/Whale';

const styles = theme => ({
	buttonLabel:{
		display: "block"
	},
	buttonContained:{
		margin: 20,
		padding: 40,
		width: "100%"
	},
	backButton:{
		marginLeft:20,
		marginTop:20
	},
	flexContainer:{
		display: "flex",
		flexWrap: "wrap"
	},
	container:{
		width: "100%"
	}
});
class RegisterChooseForm extends Component {
	constructor() {
		super();
		this.state = {  
			tabState: 0, 
		}; 
	}    

	changeTab = (tab) => {
		this.setState({ tabState: tab });
	}

	render() {
		const whaleOptions={whaleImg:'whaleWs.png', sprayColor:'#fff'};
		const { classes } = this.props;
		return ( 
			<div className={classes.flexContainer}>
				{ this.state.tabState !== 0 &&
					<Fab
					color="secondary"
					aria-label="Back"
					classes={{root:classes.backButton}}
					onClick={() => this.changeTab(0)}>
						<ChevronLeft />
					</Fab>}
				<Whale {...whaleOptions}/>
				<div className={classes.container}>
					{ this.state.tabState === 1 ?
						<RegisterEmployerForm />
						:
						(this.state.tabState === 2 ?
							<RegisterRecruiterForm /> : ''
						)
					}
				</div>
				{ this.state.tabState === 0 &&
						<React.Fragment>
							<Button 
								classes={{root:classes.buttonContained, label: classes.buttonLabel}}
								variant="contained" 
								color="secondary" 
								onClick={() => this.changeTab(1)}>
								<Business  fontSize="large"/><br/>Employer
							</Button>
							<Button 
								classes={{root:classes.buttonContained, label: classes.buttonLabel}}
								variant="contained" 
								color="secondary" 
								onClick={() => this.changeTab(2)}>
								<Person  fontSize="large"/><br/>Recruiter
							</Button>
						</React.Fragment>
				}
			</div>
		)
	}
}
export default withStyles(styles)(RegisterChooseForm);
