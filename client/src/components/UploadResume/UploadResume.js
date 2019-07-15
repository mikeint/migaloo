import React from 'react';
import AuthFunctions from '../../AuthFunctions'; 

import { FilePond, registerPlugin } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
registerPlugin(FilePondPluginFileValidateType)
class UploadResume extends React.Component{

    constructor() {
        super();
        // Initial state
        this.state = {

        };
        this.Auth = new AuthFunctions();
        this.headers = {'Authorization': 'Bearer ' + this.Auth.getToken()}
        this.fileTypes = ['application/x-pdf', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template']

    }
    render(){ 
        this.options = {
            url: "/api/resume/",
            process: {
                url: this.props.id==null?'upload/':`upload/${this.props.id}`,
                method: 'POST',
                withCredentials: false,
                headers: this.headers,
                timeout: 60000,
                onload:  (d)=>{console.log(d)},
                onerror:  (d)=>{console.log(d)},
                ondata: null
            }
        }
        return (
            <React.Fragment>
                <FilePond
                    ref={ref=>(this.fp = ref)}
                    server={this.options}
                    acceptedFileTypes={this.fileTypes}
                    allowMultiple={false}
                    maxFiles={1}
                    className="uploadFile"
                    // onupdatefiles={this.props.handleClose}
                    onprocessfile={this.props.onClose}
                    />
            </React.Fragment>
        );
    };
}

export default UploadResume;