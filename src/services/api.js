import axios from 'axios';

const api = axios.create({
    baseURL: 'https://rsdevbox.herokuapp.com'
});

export default api;