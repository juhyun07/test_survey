import axios from "axios";

export const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 300000,
    withCredentials: true
});


instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

instance.interceptors.response.use(
    async (res) => {
        return res;
    },
    (error) =>{
        const data = error.response.data;
        console.log('axios error', data);
        return error.response;
    }
)

export default instance;