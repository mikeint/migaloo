import React from 'react';
import {get} from '../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import EmailImage from '@material-ui/icons/MailOutline'; 
import TagsImage from '@material-ui/icons/Label'; 
import BenefitsImage from '@material-ui/icons/Grade'; 
import LocationImage from '@material-ui/icons/Home'; 
import CommuteImage from '@material-ui/icons/DirectionsCar'; 
import PhoneImage from '@material-ui/icons/LocalPhone'; 
import ExperienceImage from '@material-ui/icons/Computer'; 
import HighlightImage from '@material-ui/icons/Highlight'; 
import SalaryImage from '@material-ui/icons/AttachMoney'; 
import AssignmentImage from '@material-ui/icons/Assignment'; 
import JobTypeImage from '@material-ui/icons/Build'; 
import JobTitleImage from '@material-ui/icons/Work'; 

const styles = theme => ({
    infoRowContainer: { 
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        paddingLeft: '24px'
    },
    infoRow: {
        display: 'flex',
        padding: '5px 0px',
        lineHeight: '25px'
    },
    icon: {
        display: 'flex'
    },
    img: {
        width: '50px',
        paddingRight: '10px'
    },
    title: {
        display: 'flex',
        marginLeft: '10px'
    },
    item: {
        display: 'flex',
        marginLeft: '10px'
    }
});
class BenefitsPage extends React.Component{
    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
        };
    }
    render(){
        const { classes, candidateData } = this.props;
        return (
            <React.Fragment>
                <div className={classes.infoRowContainer}>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><EmailImage/></div>
                        <div className={classes.title}><b>Email: </b></div>
                        <div className={classes.item}>{candidateData.email}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><PhoneImage/></div>
                        <div className={classes.title}><b>Phone Number: </b></div>
                        <div className={classes.item}>{candidateData.phoneNumber}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><LocationImage/></div>
                        <div className={classes.title}><b>Location: </b></div>
                        <div className={classes.item}>{[candidateData.address.addressLine1, candidateData.address.addressLine2, candidateData.address.city, candidateData.address.stateProvince, candidateData.address.country].filter(d=>d!=null).join(", ")}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><CommuteImage/></div>
                        <div className={classes.title}><b>Commute Distance: </b></div>
                        <div className={classes.item}>Less than {candidateData.commute} km</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><SalaryImage/></div>
                        <div className={classes.title}><b>Salary: </b></div>
                        <div className={classes.item}>At least {candidateData.salary}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><JobTypeImage/></div>
                        <div className={classes.title}><b>Job Type: </b></div>
                        <div className={classes.item}>{candidateData.jobTypeName}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><JobTitleImage/></div>
                        <div className={classes.title}><b>Job Title: </b></div>
                        <div className={classes.item}>{candidateData.jobTitle}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><HighlightImage/></div>
                        <div className={classes.title}><b>Highlights: </b></div>
                        <div className={classes.item}>{candidateData.highlights}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><AssignmentImage/></div>
                        <div className={classes.title}><b>Responsibilities: </b></div>
                        <div className={classes.item}>{candidateData.responsibilities}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><TagsImage/></div>
                        <div className={classes.title}><b>Tags: </b></div>
                        <div className={classes.item}>{(candidateData.tagNames||[]).join(', ')}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><BenefitsImage/></div>
                        <div className={classes.title}><b>Benefits: </b></div>
                        <div className={classes.item}>{(candidateData.benefitNames||[]).join(', ')}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><ExperienceImage/></div>
                        <div className={classes.title}><b>Experience: </b></div>
                        <div className={classes.item}>{candidateData.experience} years</div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
};
export default withStyles(styles)(BenefitsPage);