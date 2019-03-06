import React from 'react';
import AuthFunctions from '../../AuthFunctions'; 
import './TagSearch.css';    
import debounce from 'lodash/debounce';
import axios from 'axios';
import Loader from '../Loader/Loader'; 

class TagSearch extends React.Component{ 
    constructor(props){
        super(props);
        this.state = { 
            tags: [],
            potentialTagList:[],
            searching: false,
            focus: true,
            tagListBoxStype:{
                marginLeft: "0px"
            },
            onChange: props.onChange
        }
        this.textInput = React.createRef();
        this.tagListBox = React.createRef();
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        this.inputPlaceholder = "Ex. Leadership, Agile, Project Management"
        
    }
    componentDidMount() {
        this.textInput.current.placeholder = this.inputPlaceholder; 
    }
    changed = () => {
        if(this.state.onChange)
            this.state.onChange(this.state.tags.map(t=>t.tag_id));
        this.updateInputLocation();
    }

    queryForTags = debounce((searchString) => {
        if(searchString.trim().length > 0){
            const lowerSearchString = searchString.toLowerCase()
            axios.get('/api/autocomplete/tag/'+lowerSearchString, this.axiosConfig)
            .then((res) => { 
                if(res.data.success) {
                    if(!res.data.tagList.find(tag=>
                        tag.tag_name.toLowerCase() === lowerSearchString
                    )){
                        res.data.tagList.unshift({tag_name:searchString,
                            tag_count: 0,
                            tag_id:-1 })
                    }
                    this.setState({potentialTagList: res.data.tagList})
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() =>  
                this.setState({searching: false})
            );
        }else{
            this.setState({potentialTagList: []})
            this.setState({searching: false})
        }
    }, 250)
    textChange = (e) =>{
        this.setState({searching: true});
        const value = e.target.value;
        this.queryForTags(value.trim());
    }
    focus = () =>{
        this.setState({focus: true});
    }
    deFocus = (e) =>{
        if(!e.relatedTarget || e.relatedTarget.id !== "tagParentElement")
            this.setState({focus: false});
    }
    updateInputLocation = () => {
        let shiftValue = this.tagListBox.current.clientWidth;
        // Leave 200px left
        shiftValue = Math.max(shiftValue-200, 0)
        this.setState({tagListBoxStype:{
            marginLeft: `-${shiftValue}px`
        }})
    }
    addTag = (tag)=>{
        var tags = this.state.tags;
        tags.push(tag);
        this.setState({tags: tags, focus: false}, this.changed);
        this.textInput.current.value = "";
    }
    removeTag = (e, i) =>{
        e.stopPropagation();
        var tags = this.state.tags;
        const removedTag = tags.splice(i, 1)[0];
        this.setState({tags: tags, focus: false}, this.changed);
        return removedTag;
    }
    editTag = (e, i) => {
        const removedTag = this.removeTag(e, i);
        this.textInput.current.value = removedTag.tag_name;
        this.textInput.current.focus();
    }
    render(){  
        return (
            <React.Fragment> 
                <div id="tagParentElement"
                    className="tagSearchContainer"
                    tabIndex="0"
                    onBlur={(e)=>this.deFocus(e)}>
                    <span className="tag-floating-label">Tags</span>
                    <div className="user-tag-wrp">
                        <span className="tag-listing" style={this.state.tagListBoxStype} ref={this.tagListBox}>
                            {this.state.tags.map((tag, i)=>
                                <span className="tag" key={i}  onClick={(e)=>this.editTag(e, i)}>
                                    {tag.tag_name} <span className="tagX" onClick={(e)=>this.removeTag(e, i)}>X</span>
                                </span>
                            )}
                        </span>
                        <input
                            className="tag-input"
                            type="text"
                            onChange={this.textChange}
                            onFocus={this.focus}
                            ref={this.textInput}
                            required/>
                    </div>
                    {/* this.state.focus && this.state.potentialTagList.length > 0 ? */
                        <div className="autoCompleteBox">
                            {!this.state.searching?this.state.potentialTagList.map((tag, i)=>
                                <div className="potentialTag" key={i} onClick={()=>this.addTag(tag)}>
                                    {tag.tag_name} <span className="tagCount">({tag.tag_count})</span>
                                </div>
                            ):<div className="loadingTags"><Loader/></div>}
                        </div>
                    /* :'' */}
                </div> 
            </React.Fragment>
        );
    }
};

export default TagSearch;
