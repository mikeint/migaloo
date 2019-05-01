import React from 'react';
import ApiCalls from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
    textField: {
      width: 400
    },
    white:{
        color:"white"
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
    },
    button: {
      width: "80%",
    },
    root:{
        backgroundImage: "linear-gradient(120deg, #96b4be 0%, #263c54 100%)",
        animation: "Gradient 7s ease infinite",
        textAlign: "center",
        position: "fixed",
        width: "100%",
        height: "100%",
        backgroundSize: "400% 400%"
    },
    formItem:{
        margin: "20px 0px"
    },
    cssLabel: {
        color: "white !important",
    },
    notchedOutline: {
        borderColor: "white !important",
    }
});

class ResetPassword extends React.Component{
    constructor(props) {
        super(props);
        const nameParam = new Buffer(props.match.params.name, 'base64').toString('ascii')
		this.state = {
            token: props.match.params.token,
            name: nameParam,
            showPassword: false,
            password: '',
            password2: '',
            login: false
        };
    }

    componentWillUnmount = () => {
        ApiCalls.cancel();
    }

    componentDidMount = () => {

    }
    handleChange = prop => event => {
        this.setState({ [prop]: event.target.value });
    };
  
    handleClickShowPassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    };
    handleSubmit = () => {
        if(this.state.password === this.state.password2){
            ApiCalls.post("/auth/resetPassword", {password:this.state.password, token: this.state.token}).then(()=>{
                this.setState({ login: true });
            })
        }
    };

    render(){ 
        if(this.state.login)
            return <Redirect to='/login'/>
        const { classes } = this.props; 
        return (
            <div className={classes.root}>
                <div className={"pageHeading "+classes.header}>Reset Password</div>
                <div className={classes.formItem+" "+classes.white}>Reset password for {this.state.name}</div>
				<div className={classes.formItem}>
                    <TextField
                        className={classes.textField}
                        variant="outlined"
                        type={this.state.showPassword ? 'text' : 'password'}
                        label="Password"
                        value={this.state.password}
                        onChange={this.handleChange('password')}
                        InputLabelProps={{
                          classes: {
                            root: classes.cssLabel,
                          },
                        }}
                        InputProps={{
                            classes: {
                              root: classes.cssOutlinedInput,
                              notchedOutline: classes.notchedOutline,
                            },
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    className={classes.white}
                                    aria-label="Toggle password visibility"
                                    onClick={this.handleClickShowPassword}
                                >
                                {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                    />
				</div>
				<div className={classes.formItem}>
                    <TextField
                        className={classes.textField}
                        variant="outlined"
                        type={this.state.showPassword ? 'text' : 'password'}
                        label="Repeat Password"
                        value={this.state.password2}
                        onChange={this.handleChange('password2')}
                        InputLabelProps={{
                          classes: {
                            root: classes.cssLabel,
                          },
                        }}
                        InputProps={{
                            classes: {
                              root: classes.cssOutlinedInput,
                              notchedOutline: classes.notchedOutline,
                            }
                        }}
                    />
				</div> 
                <Button 
                    color="primary"
                    variant="contained"
                    className={classes.button}
                    onClick={this.handleSubmit}>Reset</Button>
            </div>
        );
    }
};

export default withStyles(styles)(ResetPassword);
