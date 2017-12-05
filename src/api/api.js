import axios from 'axios';
import qs from 'qs';

let base = '';

export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };

//export const getDataGroupListPage = params => { return axios.get(`http://localhost:8081/remote/dataGroup/list`, { params: params }); };

export const getDataGroupListPage = params => { return axios.post(`/remote/dataGroup/list`, qs.stringify(params)); };

export const addDataGroup = params => { return axios.post(`/remote/dataGroup/add`, qs.stringify(params) ); };

export const removeDataGroup = params => { return axios.post(`/remote/dataGroup/remove`, qs.stringify(params)); };

//export const getData = params => {  axios.get(`/remote/dataDict/getData`, { params }).then((res)=>{return res.data}); };
export const getData = params => {return  axios.get(`/remote/dataDict/getData`, { params }); };
