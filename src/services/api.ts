import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.28.144.1:3333',
});

export default api;
