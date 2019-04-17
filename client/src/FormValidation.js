export default class FormValidation {
    constructor(parent, errorText){
        errorText.forEach(d=>{
            d.statePath = d.stateName.split('.')
        })
        this.errorText = errorText;
        this.parent = parent;
        this.isValid = this.isValid.bind(this);
        this.shouldRevalidate = this.shouldRevalidate.bind(this);
        this.getParentState = this.getParentState.bind(this);
        this.getStateValue = this.getStateValue.bind(this);
        this.hasError = this.hasError.bind(this);
    }
    shouldRevalidate(){
        if(Object.keys(this.getParentState().errors).length > 0){
            this.isValid();
        }
    }
    getParentState(){
        return this.parent.state;
    }
    getStateValue(state, d){
        return d.statePath.reduce((t,x)=> t==null?null:t[x], state)
    }
    isValid(){
        const errors = {};
        const state = this.getParentState();
        this.errorText.forEach(d=>{
            const value = this.getStateValue(state, d)
            if(!value || value.length === 0){
                errors[d.stateName] = d.errorText
            }
        })
        this.parent.setState({errors:errors});
        return Object.keys(errors).length === 0
    }
    hasError(id){
        const errorMessage = this.parent.state.errors[id];
        if(errorMessage == null)
            return {};
        else
            return {error: true, helperText: errorMessage};
    }
}
