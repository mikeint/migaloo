import AuthFunctions from './AuthFunctions';
import axios from 'axios';
var cancelToken;
const Auth = new AuthFunctions();
const axiosConfig = {
    cancelToken: null,
    headers: {'Authorization': 'Bearer ' + Auth.getToken(), 'Content-Type': 'application/json' }
}
function getNewAuthToken(){
    axiosConfig.headers = {'Authorization': 'Bearer ' + Auth.getToken(), 'Content-Type': 'application/json' }
}
const handleErrors = (errors) => {
    if (axios.isCancel(errors)) {
      console.log('Request canceled', errors.message);
    } else {
        switch(errors.response.status){
            case 404: // Not found
                console.log(`Route ${errors.response.config.url} does not exist`);
                // Until webpack is used this also means we were logged out
                if(errors.response.data.indexOf("GET /login") !== -1)
                    window.location.assign("/login")
                break;
            default:
        }
        throw errors
    }
}
function getNewCancelToken(){
    cancelToken = axios.CancelToken.source();
    axiosConfig.cancelToken = cancelToken.token;
}
getNewCancelToken();
const cancel = () =>{
    cancelToken.cancel('Operation canceled by the user.');
    getNewCancelToken();
}
const get = (url) => {
    return axios.get(url, axiosConfig)
        .catch(handleErrors);
}
const getWithParams = (url, params) => {
    const stringBuilder = [];
    Object.keys(params).forEach(k => {
        const v = params[k];
        stringBuilder.push(`${k}=${JSON.stringify(v)}`);
    });
    if(stringBuilder.length === 0){
        return get(url);
    }else{
        return axios.get(url+`?${stringBuilder.join('&')}`, axiosConfig)
            .catch(handleErrors);
    }
}
const post = (url, args) => {
    return axios.post(url, args, axiosConfig)
        .catch(handleErrors);
}
module.exports = {
    get:get,
    getWithParams:getWithParams,
    post:post,
    cancel:cancel,
    getNewAuthToken:getNewAuthToken
};