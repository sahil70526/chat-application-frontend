import React, { useState } from 'react'
import { useSelector,useDispatch } from 'react-redux'
import ScrollableFeed from "react-scrollable-feed"
import { isSameSender, isSameSenderMargin, isSameUser, isLastMessage } from '../utils/logics'
import { Tooltip } from "@chakra-ui/tooltip";
import { Avatar } from "@chakra-ui/avatar";
import { Image } from 'semantic-ui-react'
import "../pages/home.css"
import { Button } from 'semantic-ui-react'
import { setPage, fetchChats } from '../redux/chatsSlice'

function MessageHistory({ messages}) {
  const activeUser = useSelector((state) => state.activeUser);
  const [toggleButton,setToggleButton] = useState(true);
  const dispatch = useDispatch()
  const { page } = useSelector((state) => state.chats)
  const handleClick = ()=>{
    setToggleButton(!toggleButton);
    dispatch(setPage(page+1));
  }

  return (
    <>
      <ScrollableFeed className='scrollbar-hide'>
        {toggleButton?<Button color='green' style={{marginLeft:"50%"}} onClick={handleClick}>
          Load More
        </Button>:
        <Button loading color='green' style={{marginLeft:"50%"}} onClick={handleClick}>
          Load More
        </Button>}
        {messages &&
          messages.map((m, i) => {
            return <div className='flex items-center gap-x-[6px]' key={m._id} >
              {(isSameSender(messages, m, i, activeUser.id) ||
                isLastMessage(messages, i, activeUser.id)) && (
                  <Tooltip label={m.sender?.name} placement="bottom-start" hasArrow>
                    <Avatar
                      style={{ width: "40px", height: "40px" }}
                      mt="20px"
                      mr={1}
                      cursor="pointer"
                      name={m.sender?.name}
                      src={m.sender?.profilePic}
                      borderRadius="25px"
                    />
                  </Tooltip>

                )}
              {m.messageType === "text" && <span className='tracking-wider text-[15px]  font-medium'
                style={{
                  backgroundColor: `${m.sender._id === activeUser.id ? "#dcf8c6" : "#f0f0f0"
                    }`,
                  marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                  marginTop: isSameUser(messages, m, i, activeUser.id) ? 3 : 10,
                  borderRadius: `${m.sender._id === activeUser.id ? "10px 10px 0px 10px" : "10px 10px 10px 0"}`,
                  padding: "10px 18px",
                  maxWidth: "460px",
                  color: `${m.sender._id === activeUser.id ? "black" : "black"}`
                }}
              >
                {m.message}
              </span>}
              {m.messageType === 'image' &&
                <Image src={m.message} size='medium' rounded style={{
                  marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                  marginTop: isSameUser(messages, m, i, activeUser.id) ? 3 : 10,
                  borderRadius: `${m.sender._id === activeUser.id ? "10px 10px 0px 10px" : "10px 10px 10px 0"}`
                }} />
              }

              {m.messageType === 'video' &&
                <video className="h-2/3 w-1/4 rounded-md" controls
                  style={{
                    marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                    marginTop: isSameUser(messages, m, i, activeUser.id) ? 3 : 10,
                    borderRadius: `${m.sender._id === activeUser.id ? "10px 10px 0px 10px" : "10px 10px 10px 0"}`
                  }}
                >
                  <source src={m.message} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              }

              {m.messageType === 'audio' &&
                <audio controls
                  style={{
                    marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                    marginTop: isSameUser(messages, m, i, activeUser.id) ? 3 : 10,
                    borderRadius: `${m.sender._id === activeUser.id ? "10px 10px 0px 10px" : "10px 10px 10px 0"}`
                  }}
                >
                  <source src={m.message} type="audio/mpeg" />
                  Your browser does not support the video tag.
                </audio>
              }

            </div>
          })
        }
        {/* </div> */}
      </ScrollableFeed >
    </>
  )
}

export default MessageHistory