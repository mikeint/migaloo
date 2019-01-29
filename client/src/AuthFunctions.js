export default class AuthService {
    // Initializing important variables

    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken() // Getting token from localstorage
        return !!token;// handwaiving here
    }

    setToken(token, callback) {
        localStorage.setItem('token', token);
        callback && callback();
    }

    getToken() {
        return localStorage.getItem('token')
    }

    setUser(user, callback) {
        localStorage.setItem('user', JSON.stringify(user));
        callback && callback();
    }

    getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }


    /* CAR auth */
    setCarId = (id) => {
        console.log(id);
        localStorage.setItem("car_id", id);
    } 
    getCarId() {
        return localStorage.getItem("car_id");
    }
    /* CAR auth */


    logout() {
        // Clear user token and profile data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}
