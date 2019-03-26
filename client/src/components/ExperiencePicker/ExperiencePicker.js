import React from 'react';
import AuthFunctions from '../../AuthFunctions'; 
import './ExperiencePicker.css';    
import debounce from 'lodash/debounce';
import ApiCalls from '../../ApiCalls';  
import Loader from '../Loader/Loader'; 
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
    }
})
function renderInput(inputProps) {
    const { InputProps, classes, ref, ...other } = inputProps;
  
    return (
      <TextField
        InputProps={{
          inputRef: ref,
          classes: {
            root: classes.inputRoot,
            input: classes.inputInput,
          },
          ...InputProps,
        }}
        {...other}
      />
    );
  }
  
  function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
    const isHighlighted = highlightedIndex === index;
    const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;
  
    return (
      <MenuItem
        {...itemProps}
        key={suggestion.label}
        selected={isHighlighted}
        component="div"
        style={{
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {suggestion.label}
      </MenuItem>
    );
  }
  renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.number,
    index: PropTypes.number,
    itemProps: PropTypes.object,
    selectedItem: PropTypes.string,
    suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired,
  };
  
  function getSuggestions(value) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;
  
    return inputLength === 0
      ? []
      : suggestions.filter(suggestion => {
          const keep =
            count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;
  
          if (keep) {
            count += 1;
          }
  
          return keep;
        });
  }
  
class ExperiencePicker extends React.Component{ 
    constructor(props){
        super(props);
        this.state = { 
            inputValue: '',
        }
        this.Auth = new AuthFunctions();
        
    }
    
    componentDidMount() {
    }
    changed = () => {
    }

    query = debounce((searchString) => {
        if(searchString.trim().length > 0){
            const lowerSearchString = searchString.toLowerCase()
            ApiCalls.get('/api/autocomplete/experience/')
            .then((res) => { 
                if(res && res.data.success) {
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

    render(){  
        const { classes } = this.props;
        return (
            <React.Fragment> 
                <Downshift id="downshift-simple">
                    {({
                    getInputProps,
                    getItemProps,
                    getMenuProps,
                    highlightedIndex,
                    inputValue,
                    isOpen,
                    selectedItem,
                    }) => (
                    <div className={classes.container}>
                        {renderInput({
                            fullWidth: true,
                            classes,
                            InputProps: getInputProps({
                                placeholder: 'Search a country (start with a)',
                            }),
                        })}
                        <div {...getMenuProps()}>
                        {isOpen ? (
                            <Paper className={classes.paper} square>
                            {getSuggestions(inputValue).map((suggestion, index) =>
                                renderSuggestion({
                                suggestion,
                                index,
                                itemProps: getItemProps({ item: suggestion.label }),
                                highlightedIndex,
                                selectedItem,
                                }),
                            )}
                            </Paper>
                        ) : null}
                        </div>
                    </div>
                    )}
                </Downshift>
            </React.Fragment>
        );
    }
};
export default withStyles(styles)(ExperiencePicker);  