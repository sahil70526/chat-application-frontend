import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { fetchAllChats } from '../apis/chat';
const initialState = {
  chats: [],
  activeChat: '',
  isLoading: false,
  notifications: [],
  isTyping: false
};
export const fetchChats = createAsyncThunk('redux/chats', async () => {
  try {
    const data = await fetchAllChats();
    return data;
  } catch (error) {
    toast.error('Something Went Wrong!Try Again');
  }
});
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setActiveChat: (state, { payload }) => {
      state.activeChat = payload;
    },
    setNotifications: (state, { payload }) => {
      state.notifications = payload;
    },
    setUserIsTyping: (state, action) => {
      state.isTyping = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder.addCase(fetchChats.pending, (state) => {
      state.isLoading = true;
    })
    builder.addCase(fetchChats.fulfilled, (state, {payload}) => {
      state.chats = payload;
      state.isLoading = false;
    })
    builder.addCase(fetchChats.rejected, (state, action) => {
      state.isLoading = false
    })
  }
});
export const { setActiveChat, setNotifications, setUserIsTyping } = chatsSlice.actions;
export default chatsSlice.reducer;
