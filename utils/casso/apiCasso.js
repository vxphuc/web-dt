//utils/api.js
const axios = require("axios");
const queryString =  require("qs");
require("dotenv").config();
const api_key = process.env.API_KEY_CASSO;



const axiosClient = axios.create({
  baseURL: 'https://oauth.casso.vn/v2',
  headers: {
    "content-type": "application/json",
    "Authorization": `Apikey AK_CS.b8e1fdf0cf5a11f0a73fcb966f33aa53.M35e5gK4Xp6nl9Pz24kKyJl9lknCNVViYgS1IM8RQK568OPpEirhHd8ruE7jxzqBAanGyLhM`,
  },
  paramsSerializer: (params) => queryString.stringify(params),
  
});
axiosClient.interceptors.request.use(async (config) => {
  return config;
});
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    throw error;
  }
);
module.exports =  axiosClient;