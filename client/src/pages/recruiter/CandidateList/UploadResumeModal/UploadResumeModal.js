import React from 'react';
import './UploadResumeModal.css'; 
import UploadResume from "../../../../components/UploadResume/UploadResume"; 

class UploadResumeModal extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = {
        };

    }
    render(){ 
        return (
            <div className="resumeUploadModal">
                <div className='modal displayBlock'>
                    <section className='modalMain'>
                        Upload Resume
                        <hr/>
                        <UploadResume
                            id={this.props.id}
                            onClose={this.props.onClose}/>
                        <div className="rowButton"
                            onClick={this.props.onClose}>Cancel</div>
                    </section>
                </div>
            </div>
        );
    };
}

export default UploadResumeModal;