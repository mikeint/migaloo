import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {get} from '../../ApiCalls';  
import UploadImage from '../UploadImage/UploadImage'; 
import defaultProfileImage from '../../files/images/profile.png'

const styles = theme => ({
    profileImage: {
        textAlign: "center",
        display: "inline-block",
        width: "20vh",
        height: "20vh",
        borderRadius: "50%",
        border: "4px solid grey",
        boxShadow: "0px 0px 2px 2px #263c54"
    }
})
const validTypes = ["company", "accountManager", "recruiter"]
class ModifiableProfileImage extends React.Component{ 

    constructor(props) {
        super(props);
		this.state = {
            showUpload: false,
            profileImage: defaultProfileImage,
            type:props.type
        };
        if(!validTypes.includes(props.type))
            console.error(`${props.type} is not a valid type in ModifiableProfileImage`)
    }
    componentDidMount = () => {
        this.getImage();
    }
    handleClose = (err, d) => {
        this.setState({showUpload:false});
        this.getImage();
    }
    getImage = () => {
        get('/api/profileImage/view/medium')
        .then((res)=>{
            if(res == null) return
            if(res.data.success){
                this.setState({ profileImage: res.data.url }) 
            }else{
                this.setState({ profileImage: defaultProfileImage })
            }
        }).catch(errors => {
            this.setState({ profileImage: defaultProfileImage })
        })
    }
    showUpload = () => {
        this.setState({showUpload:true})
    }
    render(){
        const { classes } = this.props; 
        return (
            <React.Fragment>
                <img  className={classes.profileImage} src={this.state.profileImage} alt="" onClick={this.showUpload}/>
                {this.state.showUpload?<UploadImage 
                                            baseUrl={`/api/${this.state.type}/`}
                                            uploadUrl={"uploadImage/"}
                                            handleClose={this.handleClose} />:''}   
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(ModifiableProfileImage);
