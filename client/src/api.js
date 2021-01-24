import axios from "axios";

const baseUrl = "http://localhost:5000";

//request interceptor to add the auth token header to requests
axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers["x-auth-token"] = `Bearer ${accessToken}`; //accessToken
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

//response interceptor to refresh token on receiving token expired error
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;
    let refreshToken = localStorage.getItem("refresh");

    if (
      refreshToken &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      return axios
        .post(`${baseUrl}/refresh`, { token: refreshToken })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem("access", res.data.accessToken);
            console.log("Access token refreshed!");
            return axios(originalRequest);
          }
        });
    }
    return Promise.reject(error);
  }
);

//functions to make api calls

const api = {
  
  login: (body) => {
    return axios.post(`${baseUrl}/login`, body);
  },
  refreshToken: (body) => {
    return axios.post(`${baseUrl}/refresh`, body);
  },
  getProtected: () => {
    return axios.post(`${baseUrl}/protected`);
  },
  logout: (body) => {
    return axios.delete(`${baseUrl} /logout`, body);
  },
};

export default api;