import axios from 'axios';
import { toast } from 'react-toastify';
const API = (token) =>
  axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    headers: { Authorization: token },
  });
export const sendMessage = async (body) => {
  try {
    const token = localStorage.getItem('userToken');
    const { data } = await API(token).post('/api/message/', body);
    return data;
  } catch (error) {
    console.log('error in sendmessage api' + error);
  }
};
export const fetchMessages = async (id,page) => {
  try {
    const token = localStorage.getItem('userToken');

    const { data } = await API(token).get(`/api/message/${page?page:1}/${id}`);
    return data;
  } catch (error) {
    console.log('error in fetch Message API ' + error);
  }
};

export const shareMedia = async (file) => {
  try {
    const token = localStorage.getItem('userToken');
    const { data } = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/message/share-media`, { media: file }, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
  } catch (error) {
    console.log('error in adding image');
    toast.error('Something Went Wrong.try Again!');
  }
}
