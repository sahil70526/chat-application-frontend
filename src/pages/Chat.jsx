import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Model from '../components/Model';
import { BsEmojiSmile, BsFillEmojiSmileFill } from "react-icons/bs"
import { fetchMessages, sendMessage } from '../apis/messages';
import { useEffect } from 'react';
import MessageHistory from '../components/MessageHistory';
import io from "socket.io-client"
import "./home.css"
import { fetchChats, setNotifications, setUserIsTyping } from '../redux/chatsSlice';
import Loading from '../components/ui/Loading';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { getChatName } from '../utils/logics';
import Typing from '../components/ui/Typing';
import { validUser } from '../apis/auth';
import { Icon } from 'semantic-ui-react'
import { shareMedia } from '../apis/messages';
import { ReactMic } from 'react-mic';
const ENDPOINT = process.env.REACT_APP_SERVER_URL
let socket, selectedChatCompare;

function Chat(props) {
  const { activeChat, notifications } = useSelector((state) => state.chats)
  const dispatch = useDispatch()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false);
  const activeUser = useSelector((state) => state.activeUser);
  const [isRecording, setIsRecording] = useState(false)

  const keyDownFunction = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && (message)) {
      messageLogic(message, "text");
    }
    else if (e.target && e.target.files) {
      messageLogic(e.target.files[0]);
    }
    else if (e.size) {
      messageLogic(e);
    }
  }

  const messageLogic = async (e, mtype) => {
    setMessage("")
    socket.emit("stop typing", activeChat._id)
    let data = (e.size) && await shareMedia(e);
    const data1 = await sendMessage({ chatId: activeChat._id, messageType: mtype?.length > 0 ? mtype : data.contentType, message: data?.mediaUrl ? data?.mediaUrl : e });
    socket.emit("new message", data1)
    setMessages([...messages, data1])
    dispatch(fetchChats())
  }

  useEffect(() => {
    socket = io(ENDPOINT)
    socket.on("typing", () => setIsTyping(true))
    socket.on("stop typing", () => setIsTyping(false))
  }, [])

  useEffect(() => {
    socket.emit("setup", activeUser)
    socket.on("connected", () => {
      setSocketConnected(true)
    })
  }, [messages, activeUser])
  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (activeChat) {
        setLoading(true)
        const data = await fetchMessages(activeChat._id)
        setMessages(data)
        socket.emit("join room", activeChat._id)
        setLoading(false)

      }
      return
    }
    fetchMessagesFunc()
    selectedChatCompare = activeChat

  }, [activeChat])
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if ((!selectedChatCompare || selectedChatCompare._id) !== newMessageRecieved.chatId._id) {
        if (!notifications.includes(newMessageRecieved)) {
          dispatch(setNotifications([newMessageRecieved, ...notifications]))
        }
      }
      else {
        setMessages([...messages, newMessageRecieved])
      }
      dispatch(fetchChats())
    })
  })
  useEffect(() => {
    const isValid = async () => {
      const data = await validUser()
      if (!data?.user) {
        window.location.href = "/login"
      }

    }
    isValid()
  }, [])
  if (loading) {
    return <div className={props.className}>
      <Loading />
    </div>
  }

  const onStartRecording = () => {
    console.log('Recording started');
    setIsRecording(true);
  };

  const onStopRecording = async (recordedBlob) => {
    console.log('Recording stopped');
    setIsRecording(false);
    const audioFile = new File([recordedBlob.blob], 'recorded_audio.wav', {
      type: 'audio/wav',
    });
    // Create a FormData object and append the file
    keyDownFunction(audioFile)
  };

  // const addNewMediaMessage = async (e) => {
  //   let data = await shareMedia(e.target.files[0]);

  // }
  return (
    <>
      {
        activeChat ?
          <div className={props.className}>
            <div className='flex justify-between items-center px-5 bg-[#075e54] w-[100%] h-[8%]'>
              <div className='flex items-center gap-x-[10px]'>
                <Model />
                <div className='flex flex-col items-start justify-center'>
                  <h5 className='text-[17px] text-[white] font-bold tracking-wide'>{getChatName(activeChat, activeUser)}</h5>
                  {isTyping && <p className='text-[11px] text-[#aabac8]'>typing ...</p>}
                </div>
              </div>
              <div>
              </div>
            </div>
            <div className='scrollbar-hide w-[100%] h-[70vh] md:h-[66vh] lg:h-[69vh] flex flex-col overflow-y-scroll p-4' >
              <MessageHistory typing={isTyping} messages={messages} />
              <div className='ml-7 -mb-10'>
                {
                  isTyping ?
                    <Typing width="100" height="100" /> : ""
                }

              </div>
            </div>
            <div className='' style={{ position: 'absolute', bottom: 10 }}>
              {
                showPicker && <Picker data={data} onEmojiSelect={(e) => setMessage(message + e.native)} />
              }
              <div className='flex justify-center items-center bg-[#EEEEEE] items-start w-[10rem] sm:w-[15rem] md:w-[25rem] h-[60px] lg:w-[85rem]'>
                <div className='cursor-pointer items-center' style={{ marginRight: 3 }} onClick={() => setShowPicker(!showPicker)}>
                  {showPicker ? <BsFillEmojiSmileFill className='w-[20px] h-[20px] text-[#ffb02e] border-[black]' /> : <BsEmojiSmile className='w-[20px] h-[20px]' />}
                </div>
                <form onKeyDown={(e) => keyDownFunction(e)} onSubmit={(e) => e.preventDefault()}>
                  <input
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (!socketConnected) return
                      if (!typing) {
                        setTyping(true)
                        dispatch(setUserIsTyping(isTyping))
                        socket.emit('typing', activeChat._id)
                      }
                      let lastTime = new Date().getTime()
                      var time = 3000
                      setTimeout(() => {
                        var timeNow = new Date().getTime()
                        var timeDiff = timeNow - lastTime
                        if (timeDiff >= time && typing) {
                          socket.emit("stop typing", activeChat._id)
                          setTyping(false);
                          dispatch(setUserIsTyping(isTyping))
                        }
                      }, time)
                    }}
                    style={{ margin: 2 }}
                    className='w-[10rem] sm:w-[15rem] md:w-[25rem] h-[50px] lg:w-[55rem] rounded-[10px] focus:outline-0 w-[100%] h-[50px] bg-[#fff]' type="text" name="message" placeholder="Enter message" value={message} />
                </form>
                <div style={{ display: "none" }}>
                  <ReactMic
                    record={isRecording}
                    className="sound-wave"
                    onStop={onStopRecording}
                    onStart={onStartRecording}
                    mimeType="audio/wav"
                  />
                </div>
                {(typing || message.length > 0) ? <Icon name='paper plane' color='green' circular='true' size='large' onClick={(e) => keyDownFunction(e)} style={{ cursor: 'pointer' }} /> :
                  <Icon name='microphone' color={isRecording ? "green" : "white"} circular='true' size='large' style={{ cursor: 'pointer' }} onClick={() => setIsRecording(!isRecording)} />}
                <Icon name='folder open outline' color='white' circular='true' size='large' onClick={() => document.getElementById("input-image").click()} style={{ cursor: 'pointer' }} />
                <input type='file' id='input-image' hidden="true" onChange={keyDownFunction} />
              </div>
            </div>
          </div> :
          <div className={props.className}>
            <div className='relative'>
              <div className='absolute top-[40vh] left-[44%] flex flex-col items-center justify-center gap-y-3'>
                <img className='w-[50px] h-[50px] rounded-[25px]' alt="User profile" src={activeUser.profilePic} />
                <h3 className='text-[#111b21] text-[20px] font-medium tracking-wider'>Welcome <span className='text-[#166e48] text-[19px] font-bold'> {activeUser.name}</span></h3>
              </div>
            </div>
          </div>

      }
    </>
  )
}

export default Chat