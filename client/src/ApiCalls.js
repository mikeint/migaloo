import AuthFunctions from './AuthFunctions';
import axios from 'axios';

const Auth = new AuthFunctions();
const axiosConfig = {
    headers: {'Authorization': 'Bearer ' + Auth.getToken(), 'Content-Type': 'application/json' }
}
const handleErrors = (errors) => {
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
const get = (url) => {
    return axios.get(url, axiosConfig)
    .catch(handleErrors)
}
const post = (url, args) => {
    return axios.post(url, args, axiosConfig)
    .catch(handleErrors)
}
module.exports = {
    get:get,
    post:post
};