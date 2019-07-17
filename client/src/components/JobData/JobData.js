import React from 'react';
import { withStyles } from '@material-ui/core/styles';  
import TagsImage from '@material-ui/icons/Label'; 
import BenefitsImage from '@material-ui/icons/Grade'; 
import LocationImage from '@material-ui/icons/Home'; 
import CompanyImage from '@material-ui/icons/Business'; 
import ExperienceImage from '@material-ui/icons/Computer'; 
import SalaryImage from '@material-ui/icons/AttachMoney'; 
import AssignmentImage from '@material-ui/icons/Assignment'; 
import JobTypeImage from '@material-ui/icons/Build'; 
import JobTitleImage from '@material-ui/icons/Work'; 
import PostedTimeImage from '@material-ui/icons/AccessTime'; 
import NumberInterviewsImage from '@material-ui/icons/SupervisorAccount'; 
import OpenReasonImage from '@material-ui/icons/Feedback'; 

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
class JobData extends React.Component{
    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
        };
    }
    render(){
        const { classes, jobData } = this.props;
        return (
            <React.Fragment>
                <div className={classes.infoRowContainer}>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><CompanyImage/></div>
                        <div className={classes.title}><b>Company: </b></div>
                        <div className={classes.item}>{jobData.companyName}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><LocationImage/></div>
                        <div className={classes.title}><b>Location: </b></div>
                        <div className={classes.item}>{jobData.address ? [jobData.address.addressLine1, jobData.address.addressLine2, jobData.address.city, jobData.address.stateProvince, jobData.address.country].filter(d=>d!=null).join(", ") : ''}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><JobTitleImage/></div>
                        <div className={classes.title}><b>Job Title: </b></div>
                        <div className={classes.item}>{jobData.title}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><SalaryImage/></div>
                        <div className={classes.title}><b>Salary: </b></div>
                        <div className={classes.item}>{Math.ceil(jobData.salary/1000)}k</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><ExperienceImage/></div>
                        <div className={classes.title}><b>Experience: </b></div>
                        <div className={classes.item}>At least {jobData.experience} years</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><JobTypeImage/></div>
                        <div className={classes.title}><b>Job Type: </b></div>
                        <div className={classes.item}>{jobData.jobTypeName}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><AssignmentImage/></div>
                        <div className={classes.title}><b>Requirements: </b></div>
                        <div className={classes.item}>{jobData.requirements}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><TagsImage/></div>
                        <div className={classes.title}><b>Tags: </b></div>
                        <div className={classes.item}>{(jobData.tagNames||[]).join(', ')}</div>
                    </div>
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><BenefitsImage/></div>
                        <div className={classes.title}><b>Benefits: </b></div>
                        <div className={classes.item}>{(jobData.benefitNames||[]).join(', ')}</div>
                    </div>
                    {jobData.openPositions != null &&
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><BenefitsImage/></div>
                        <div className={classes.title}><b>Open Positions: </b></div>
                        <div className={classes.item}>{jobData.openPositions}</div>
                    </div>
                    }
                    {jobData.interviewCount != null &&
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><NumberInterviewsImage/></div>
                        <div className={classes.title}><b>Required Number of Interviewees: </b></div>
                        <div className={classes.item}>{jobData.interviewCount}</div>
                    </div>
                    }
                    {jobData.openingReasonId != null &&
                        <div className={classes.infoRow}>
                            <div className={classes.icon}><OpenReasonImage/></div>
                            <div className={classes.title}><b>Opening Reason: </b></div>
                            <div className={classes.item}>{jobData.openingReasonName}</div>
                        </div>
                    }
                    {jobData.openingReasonComment != null &&
                        <div className={classes.infoRow}>
                            <div className={classes.icon}><OpenReasonImage/></div>
                            <div className={classes.title}><b>Opening Reason Comment: </b></div>
                            <div className={classes.item}>{jobData.openingReasonComment}</div>
                        </div>
                    }
                    <div className={classes.infoRow}>
                        <div className={classes.icon}><PostedTimeImage/></div>
                        <div className={classes.title}><b>Posted </b></div>
                        <div className={classes.item}>{jobData.posted}</div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
};
export default withStyles(styles)(JobData);