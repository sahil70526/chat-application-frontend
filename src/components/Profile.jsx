import React, { useState } from 'react'
import { IoArrowBack } from "react-icons/io5"
import { useDispatch, useSelector } from 'react-redux'
import { setShowProfile } from '../redux/profileSlice'
import { IoMdLogOut } from "react-icons/io"
import InputEdit from './profile/InputEdit'
import { updateUser, addNewProfileImage } from '../apis/auth'
import { toast } from 'react-toastify'
import { setUserNameAndBio } from '../redux/activeUserSlice'
import { Icon } from 'semantic-ui-react';
function Profile(props) {
  const dispatch = useDispatch()
  const { showProfile } = useSelector((state) => state.profile)
  const activeUser = useSelector((state) => state.activeUser)
  const [formData, setFormData] = useState({
    name: activeUser.name,
    bio: activeUser.bio,
    imageName: ""
  })
  const logoutUser = () => {
    toast.success("Logout Successfull!")
    localStorage.removeItem("userToken")
    window.location.href = "/login"
  }
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  const submit = async () => {

    dispatch(setUserNameAndBio(formData))
    toast.success("Updated!")
    await updateUser(activeUser.id, formData)

  }

  const addNewImage = async (e) => {
    let data = await addNewProfileImage(e.target.files[0]);
    console.log(`${process.env.REACT_APP_SERVER_URL}/api/user/profileImage/download/${data.filename}`)
    setFormData({ ...formData, imageName: data.filename })
  }

  return (

    <div style={{ transition: showProfile ? "0.3s ease-in-out" : "" }} className={props.className}>
      <div className='absolute  w-[100%]'>
        <div className='bg-[#166e48] pt-12 pb-3'>
          <button onClick={() => dispatch(setShowProfile(false))} className='flex items-center'>
            <IoArrowBack style={{ color: "#fff", width: "30px", height: "20px" }} />
            <h6 className='text-[16px] text-[#fff] font-semibold'>Profile</h6>
          </button>
        </div>
        <div className=' pt-5' >
          <div className='flex items-center flex-col group'>
            {/* class="h-auto max-w-lg transition-all duration-300 rounded-lg blur-sm hover:blur-none" */}
            <img className='w-[150px] h-[150px] rounded-[100%] -ml-5 transition-all duration-300 hover:blur-sm cursor-pointer' src={formData?.imageName ? `${process.env.REACT_APP_SERVER_URL}/api/user/profileImage/download/${formData.imageName}` : activeUser?.profilePic} alt="" />
            <div>
              <button className='invisible group-hover:visible'>
              <Icon  color='green' name='add circle' size='big' style={{ position: "absolute", zIndex: "1", top: 150,left:155, cursor: "pointer" }} onClick={() => document.getElementById("input-image").click()} />
              </button>
            </div>
            <input type='file' id='input-image' hidden="true" onChange={addNewImage} />
          </div>
          <InputEdit type="name" handleChange={handleChange} input={formData.name} handleSubmit={submit} />
          <div>

            <div className='py-5 px-4'>
              <p className='text-[10px] tracking-wide text-[#3b4a54] '>
                This is not your username or pin. This name will be visible to your contacts
              </p>
            </div>

          </div>
          <InputEdit type="bio" handleChange={handleChange} input={formData.bio} handleSubmit={submit} />
        </div>

        <div onClick={logoutUser} className='flex items-center justify-center mt-5 cursor-pointer shadow-2xl'>
          <IoMdLogOut className='text-[#e44d4d] w-[27px] h-[23px]' />
          <h6 className='text-[17px] text-[#e44d4d] font-semibold'>Logout</h6>
        </div>
      </div>
    </div>
  )
}

export default Profile