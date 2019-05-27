import React from 'react';
import AuthFunctions from '../../../AuthFunctions'; 
import debounce from 'lodash/debounce';
import {get} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import { MenuItem, Input, FormControl, FormHelperText, Chip } from '@material-ui/core';
  
const styles = theme => ({
    chip: {
        marginRight: "5px"
    },
    textField: {
        width: 400,
    },
    userTagWrp: {
        overflow: "hidden",
        margin: "5px 0"
    },
    autoCompleteBox: {
        display: "flex",
        flexWrap: "wrap",
        paddingTop: 15
    }
})
class SkillSearch extends React.Component{ 
    constructor(props){
        super(props);
        this.state = { 
            tags: [],
            potentialTagList:[],
            searching: false,
            jobType: props.jobType,
            textValue: '',
            onChange: props.onChange,
            error: false,
            helperText: ''
        }
        this.Auth = new AuthFunctions();
        
    }
    componentDidMount() {
    }
    changed = () => {
        if(this.state.onChange)
            this.state.onChange(this.state.tags.map(t=>t.tagId));
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
                    this.setState({potentialTagList: res.data.tagList, searching: false})
                }else
                    this.setState({searching: false})
            })
            .catch(error => {
                console.log(error);
                this.setState({searching: false})
            })
        }else{
            this.setState({potentialTagList: [], searching: false})
        }
    }, 250)
    textChange = (e) =>{
        const value = e.target.value;
        this.setState({searching: true, textValue: value});
        this.queryForTags(value.trim());
    }
    addTag = (tag)=>{
        var tags = this.state.tags;
        tags.push(tag);
        this.setState({tags: tags, potentialTagList: [], textValue: ""}, this.changed);
    }
    removeTag = (e, i) =>{
        e.stopPropagation();
        var tags = this.state.tags;
        const removedTag = tags.splice(i, 1)[0];
        this.setState({tags: tags}, this.changed);
        return removedTag;
    }
    render(){  
        const { classes } = this.props;
        return (
            <React.Fragment> 
                <div>
                    <FormControl
                            {...(this.state.error?{error:true}:{})}>
                        
                        Skills
                        <div className={classes.userTagWrp}>
                            {this.state.tags.map((tag, i)=>
                                <Chip
                                    label={tag.tagName}
                                    key={i}
                                    onDelete={(e)=>this.removeTag(e, i)}
                                    className={classes.chip}
                                    color="secondary"
                                />
                            )}
                        </div>
                        <Input
                            id="skills-search-helper"
                            className={classes.textField}
                            placeholder="Ex. Leadership, Agile, Project Management"
                            value={this.state.textValue}
                            onChange={this.textChange}
                            {...(this.state.error?{error:true, helperText:this.state.helperText}:{})}
                        />
                        <FormHelperText>{this.state.helperText}</FormHelperText>
                        {this.state.potentialTagList.length > 0 &&
                            <div className={classes.autoCompleteBox}>
                                {!this.state.searching && this.state.potentialTagList.map((tag, i)=>
                                    <MenuItem
                                        key={i}
                                        component="div"
                                        onClick={()=>this.addTag(tag)}
                                    >
                                        {tag.tagName}
                                    </MenuItem>
                                )}
                            </div>
                        }
                    </FormControl>
                </div> 
            </React.Fragment>
        );
    }
};
export default withStyles(styles)(SkillSearch);  