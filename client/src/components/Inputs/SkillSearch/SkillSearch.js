import React from 'react';
import AuthFunctions from '../../../AuthFunctions'; 
import debounce from 'lodash/debounce';
import {get, cancel} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import { MenuItem, TextField, FormControl, Chip } from '@material-ui/core';
  
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
            label: props.label || 'Skills',
            tags: props.value || [],
            potentialTagList:[],
            searching: false,
            jobTypeId: props.jobTypeId,
            textValue: '',
            onChange: props.onChange,
            error: false,
            helperText: ''
        }
        this.Auth = new AuthFunctions();
    }
    componentDidMount() {
        if(this.state.tags.length > 0)
            this.tagByIds()
    }
    componentWillUnmount() {
        cancel()
    }
    changed = () => {
        if(this.state.onChange)
            this.state.onChange({tagIds:this.state.tags.map(t=>t.tagId)});
    }
    shouldComponentUpdate(nextProps, nextState) {
        var change = false
        if(this.state !== nextState)
            change = true;
        if(this.state.error !== nextProps.error || this.state.helperText !== nextProps.helperText){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
            change = true;
        }
        if(nextProps.value != null && this.state.tags.length === 0 && this.state.tags !== nextProps.value){
            this.setState({ tags: nextProps.value, jobTypeId: nextProps.jobTypeId }, this.tagByIds);
            change = true;
        }
        if(nextProps.jobTypeId != null && this.state.jobTypeId !== nextProps.jobTypeId){
            this.setState({ jobTypeId: nextProps.jobTypeId });
            change = true;
        }
        return change;
    }
    
    tagByIds = () => {
        const ids = this.state.tags.filter(d=>!isNaN(d)).join(',')
        get(`/api/autocomplete/tagById/${ids}`)
        .then((res) => { 
            if(res && res.data.success) {
                this.setState({tags: this.state.tags.map(d=>res.data.tagList.find(d2=>d2.tagId === d))})
            }
        })
        .catch(error => {
            console.log(error);
        })
    }
    queryForTags = debounce((searchString) => {
        if(searchString.trim().length > 0){
            const lowerSearchString = searchString.toLowerCase()
            get(`/api/autocomplete/tagByType/${this.state.jobTypeId}/${lowerSearchString}`)
            .then((res) => { 
                if(res && res.data.success) {
                    // if(!res.data.tagList.find(tag=>
                    //     tag.tagName.toLowerCase() === lowerSearchString
                    // )){
                    //     res.data.tagList.unshift({tagName:searchString,
                    //         tagCount: 0,
                    //         tagId:-1 })
                    // }
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
                        
                        {this.state.label}
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
                        <TextField
                            className={classes.textField}
                            placeholder="Ex. Leadership, Agile, Project Management"
                            value={this.state.textValue}
                            onChange={this.textChange}
                            {...(this.state.error?{error:true, helperText:this.state.helperText}:{})}
                        />
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