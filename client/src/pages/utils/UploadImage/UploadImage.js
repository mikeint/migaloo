import React from 'react';
import './UploadImage.css'; 
import AuthFunctions from '../../../AuthFunctions'; 

import { FilePond, registerPlugin } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
registerPlugin(FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview)
class UploadImage extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = {
            baseUrl: props.baseUrl,
            uploadUrl: props.uploadUrl,
        };
        this.Auth = new AuthFunctions();
        this.headers = {'Authorization': 'Bearer ' + this.Auth.getToken()}
    }
    render(){ 
        this.options = {
            url: this.state.baseUrl,
            process: {
                url: this.state.uploadUrl,
                method: 'POST',
                withCredentials: false,
                headers: this.headers,
                timeout: 60000,
                onload:  (d)=>{console.log(d)},
                onerror:  (d)=>{console.log(d)},
                ondata: null
            }
        }
        this.transformOptions =  {
            'medium_': (transforms) => {
                transforms.resize.size.width = 384;
                return transforms;
            },
            'small_': (transforms) => {
                transforms.resize.size.width = 128;
                return transforms;
            }
        }
        return (
            <div className='imageUploadModal'>
                <div className='modal displayBlock'>
                    <section className='modalMain'>
                        Upload Image
                        <hr/>
                        <FilePond
                            ref={ref=>(this.fp = ref)}
                            server={this.options}
                            allowImagePreview={false}
                            allowMultiple={false}
                            maxFiles={1}
                            imageTransformOutputMimeType='image/jpg'
                            imageResizeTargetWidth={600}
                            imageCropAspectRatio={"1:1"}
                            imageTransformVariants={this.transformOptions}
                            className="uploadFile"
                            // onupdatefiles={this.props.handleClose}
                            onprocessfile={this.props.handleClose}
                            />
                        <div className="rowButton" onClick={this.props.handleClose}>Cancel</div>
                    </section>
                </div>
            </div>
        );
    };
}

export default UploadImage;