export default class FormValidation {
    constructor(parent, errorText){
        errorText.forEach(d=>{
            d.statePath = d.stateName.split('.')
            if(d.stateName2 != null)
                d.statePath2 = d.stateName2.split('.')
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
    getStateValue(state, path){
        return path.reduce((t,x)=> t==null?null:t[x], state);
    }
    isValid(){
        const errors = {};
        const state = this.getParentState();
        this.errorText.forEach(d=>{
            const value = this.getStateValue(state, d.statePath);
            const isString = typeof value === 'string';
            if(value == null || (isString && value.length === 0)){
                if(errors[d.stateName] == null)
                    errors[d.stateName] = d.errorText;
            }
            else if (d.length != null && value.length < d.length){
                if(errors[d.stateName] == null)
                    errors[d.stateName] = `Must at least ${d.length} characters long`;
            }
            else if(d.type === 'password'){
                const value2 = this.getStateValue(state, d.statePath2)
                if(value !== value2 && errors[d.stateName2] == null)
                    errors[d.stateName2] = d.errorText;
            }
            else if(d.type === 'regex'){
                if(d.regex.some((re)=>re.exec(value) == null)){
                    if(errors[d.stateName] == null)
                        errors[d.stateName] = d.errorText;
                }
            }
            else if(d.type === 'number'){
                if(d.gt != null && value <= d.gt){
                    if(errors[d.stateName] == null)
                        errors[d.stateName] = d.errorText;
                }
                if(d.lt != null && value >= d.lt){
                    if(errors[d.stateName] == null)
                        errors[d.stateName] = d.errorText;
                }
            }
        })
        this.parent.setState({errors:errors});
        return Object.keys(errors).length === 0;
    }
    hasError(id){
        const errorMessage = this.parent.state.errors[id];
        if(errorMessage == null)
            return {};
        else
            return {error: true, helperText: errorMessage};
    }
}
