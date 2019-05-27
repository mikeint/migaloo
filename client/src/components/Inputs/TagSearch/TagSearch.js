import React from 'react';
import AuthFunctions from '../../../AuthFunctions'; 
import './TagSearch.css';    
import debounce from 'lodash/debounce';
import {get} from '../../../ApiCalls';  
import LoaderSquare from '../../LoaderSquare/LoaderSquare';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
  
const styles = theme => ({
    chip: {
        marginRight: "5px"
    },
    textField: {
        width: 400,
    },
    userTagWrp: {
        overflow: "hidden"
    },
    floatingLabel:{
        fontSize: "13px",
        color: "#263c54",
        opacity: 0.6,
        fontWeight: "bold"
    },
    errorFloatingLabel:{
        color: "red"
    }
})
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
            jobType: props.jobType,
            textValue: '',
            onChange: props.onChange,
            error: false,
            helperText: ''
        }
        this.textInput = React.createRef();
        this.tagListBox = React.createRef();
        this.Auth = new AuthFunctions();
        
    }
    componentDidMount() {
    }
    changed = () => {
        if(this.state.onChange)
            this.state.onChange(this.state.tags.map(t=>t.tagId));
        this.updateInputLocation();
    }
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.error !== nextProps.error || this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && this.state.tags !== nextProps.value){
            this.setState({ tags: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    queryForTags = debounce((searchString) => {
        if(searchString.trim().length > 0){
            const lowerSearchString = searchString.toLowerCase()
            get(`/api/autocomplete/tagByType/${this.state.jobType}/${lowerSearchString}`)
            .then((res) => { 
                if(res && res.data.success) {
                    if(!res.data.tagList.find(tag=>
                        tag.tagName.toLowerCase() === lowerSearchString
                    )){
                        res.data.tagList.unshift({tagName:searchString,
                            tagCount: 0,
                            tagId:-1 })
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
        const value = e.target.value;
        this.setState({searching: true, textValue: value});
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
        this.setState({tags: tags, focus: false, potentialTagList: []}, this.changed);
        // this.textInput.current.value = "";
        this.setState({textValue: ""});
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
        // this.textInput.current.value = removedTag.tagName;
        this.setState({textValue: removedTag.tagName});
        this.textInput.current.focus();
    }
    render(){  
        const { classes } = this.props;
        return (
            <React.Fragment> 
                <div id="tagParentElement"
                    className="tagSearchContainer"
                    tabIndex="0"
                    onBlur={(e)=>this.deFocus(e)}>
                    <span className={classes.floatingLabel+" "+(this.state.error?classes.errorFloatingLabel:"")}>Tags</span>
                    
                    <div className={classes.userTagWrp}>
                        <span className="tag-listing" style={this.state.tagListBoxStype} ref={this.tagListBox}>
                            {this.state.tags.map((tag, i)=>
                                <Chip
                                    label={tag.tagName}
                                    key={i}
                                    onDelete={(e)=>this.removeTag(e, i)}
                                    className={classes.chip}
                                    color="secondary"
                                />
                            )}
                        </span>
                        
                        <TextField
                            className={classes.textField}
                            required
                            placeholder="Ex. Leadership, Agile, Project Management"
                            ref={this.textInput}
                            onFocus={this.focus}
                            onChange={this.textChange}
                            margin="normal"
                            {...(this.state.error?{error:true, helperText:this.state.helperText}:{})}
                        />
                    </div>
                    {this.state.potentialTagList.length > 0 &&
                        <div className="autoCompleteBox">
                            {!this.state.searching?this.state.potentialTagList.map((tag, i)=>
                                <div className="potentialTag" key={i} onClick={()=>this.addTag(tag)}>
                                    {tag.tagName} <span className="tagCount">({tag.tagCount})</span>
                                </div>
                            ):<div className="loadingTags"><LoaderSquare/></div>}
                        </div>
                    /* :'' */}
                </div> 
            </React.Fragment>
        );
    }
};
export default withStyles(styles)(TagSearch);  