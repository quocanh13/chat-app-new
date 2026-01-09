import { useContext, useState } from "react"
import {Member, Room, User} from "../utils/types.js"

import Loading from "./Loading.js"
import { ChatAppContext } from "./ChatApp.js"
import { postRoom } from "../request/room.js"
import { createPopUp } from "../utils/popUp/popUp.js"
import { sendFile } from "../request/message.js"
import { updateAvatar, updateUserInformation } from "../request/user.js"
import { isImage } from "../utils/checkFileType.js"

/*******************************  Sidebar ***************************************/

export default function Sidebar({roomList}) {
    const [searchTerm, setSearchTerm] = useState("")
    return (
        <div>
            <SidebarHeader />
            <RoomSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            {roomList == null ? <Loading /> : <RoomList searchTerm={searchTerm}/>}
        </div>
    )
}

/**
 * @param {Object} p 
 * @param {string} p.userAvatar
 */
function SidebarHeader() {
    const {user} = useContext(ChatAppContext)
    const [showUserInformation, setShowUserInformation] = useState(false)
    const [showAddRoomForm, setShowAddRoomForm] = useState(false)

    return (
        <div className="sidebar-header">
            <h3 className="sidebar-title">Đoạn Chat</h3>
            <div className="sidebar-actions">
                <div className="avatar-wrapper">
                    <img 
                        src={user.avatar ? `/file/${user.avatar}/view` : '../images/default-user-avatar.png'} 
                        alt="User Avatar" 
                        className="user-avatar" 
                        onClick={()=>{setShowUserInformation(true)}}
                    />
                </div>
                <button className="btn-new-room" onClick={()=>{setShowAddRoomForm(true)}}>
                    <img src={"../images/new-room-icon.png"} alt="New Room"/>
                </button>
            </div>
            {showUserInformation && <UserInformationCard setShowUserInformation={setShowUserInformation}/>}
            {showAddRoomForm && <AddRoomForm setShowAddRoomForm={setShowAddRoomForm}/>}
        </div>
    )
}

function RoomSearchBar({searchTerm, setSearchTerm}) {
    function onChange(e) {
        setSearchTerm(e.target.value)
        console.log(e.target.value)
    }
    return (
        <div className="room-search-container">
            <form className="search-form">
                <div className="search-input-wrapper">
                    <img 
                        src="/images/search-bar-icon.png" 
                        alt="search" 
                        className="search-icon"
                    />
                    <input 
                        type="text" 
                        name="room-name" 
                        className="search-input"
                        placeholder="Tìm kiếm trên Messenger"
                        onChange={onChange}
                    />
                </div>
            </form>
        </div>
    )
}

/**
 * @param {Object} p
 * @param {Room[]} p.roomList
 */
function RoomList({searchTerm}) {
    const {roomList} = useContext(ChatAppContext)
    return (
        <div className="room-list-container">
            {roomList.map((v, i) => {
                if(v.roomName.includes(searchTerm.toLowerCase())) return <RoomListCard room={v} key={v.roomID} />;
            })}
        </div>
    );
}

/**
 * @param {Object} p
 * @param {Room} p.room
 */
function RoomListCard({room}) {
    const {setCurRoom} = useContext(ChatAppContext)

    const latestMessage = {
        name : "",
        message : ""
    }

    return (
        <div className="room-card" onClick={()=>{setCurRoom(room)}}>
            <div className="room-avatar-wrapper">
                <img src={"/images/default-room-icon.png"} alt="room" className="room-avatar" />
                {/* <div className="online-indicator"></div> */}
            </div>
            
            <div className="room-info">
                <div className="room-name">{room.roomName}</div>
                <div className="room-latest-msg">
                    <span className="msg-author">{latestMessage.name} </span>
                    <span className="msg-text">{latestMessage.message}</span>
                    {/* <span className="msg-time"> • 2 phút</span> */}
                </div>
            </div>
        </div>
    );
}

/**
 * @param {Object} p
 * @param {function() : void} p.setShowUserInformation
 */
function UserInformationCard({setShowUserInformation}) {
    const {user, setReloadRoomList} = useContext(ChatAppContext);
    const [avatar, setAvatar] = useState((user.avatar ? `/file/${user.avatar}/view` : "../images/default-user-avatar.png"))

    function onChangeAvatarClick() {
        const input = document.querySelector("#attach-avatar")
        input.click()
    }

    function onChangeInput(e) {
        if(isImage(e.target.files[0].type)) {
            setAvatar(URL.createObjectURL(e.target.files[0]))
        } else {
            createPopUp({message : "File phải là file ảnh", error : true})
        }
    }

    async function onSubmit() {
        setShowUserInformation(false)
        const formData = new FormData(document.querySelector(".user-info-form"))
        const file = formData.get("avatar")
        if(file.size != 0 && isImage(file.type)) {
            const avatarRes = await updateAvatar(formData, user.username)
            if(avatarRes.type != "OK") {
                createPopUp(avatarRes)
                return
            }
        }
        const userRes = await updateUserInformation(formData.get("username"), formData.get("password"), formData.get("name"))
        if(userRes.type != "OK") {
            createPopUp(userRes)
            return
        }

        createPopUp({message : "Bạn đã cập nhật thông tin thành công", error : false})
        setReloadRoomList(pre=>!pre)
    }

    return (
        <div className="user-info-overlay"> {/* Lớp phủ tối màu nền */}
            <div className="user-info-card">
                <h3 className="user-info-title">Thông Tin Người Dùng</h3>
                <img src={avatar} alt="" onClick={onChangeAvatarClick}/>
                <form className="user-info-form">
                    <input type="file" name="avatar" id="attach-avatar" onChange={onChangeInput}/>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" name="username" value={user.username} onChange={(e)=>{e.target.value}}/>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="text" name="password" placeholder={user.password}/>
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" placeholder={user.name} />
                    </div>
                    <div className="user-info-actions">
                        <button type="button" className="btn-close" onClick={()=>{setShowUserInformation(false)}}>Đóng</button>
                        <button type="button" className="btn-save" onClick={onSubmit}>Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * @param {Object} p
 * @param {function() : void} p.setShowAddRoomForm
 */
function AddRoomForm({ setShowAddRoomForm }) {
    const {setReloadRoomList} = useContext(ChatAppContext)
    async function onSubmit() {
        setShowAddRoomForm(false)
        const formData = new FormData(document.querySelector(".add-room-card .user-info-form"))
        const res = await postRoom(formData.get("roomName"))
        if(res.type == "OK") {
            setReloadRoomList(pre => !pre)
        }
        createPopUp(res)
    }

    return (
        <div className="user-info-overlay"> {/* Dùng chung overlay với UserInfo để làm tối nền */}
            <div className="add-room-card">
                <h3 className="user-info-title">Tạo Nhóm Mới</h3>
                <form className="user-info-form" >
                    <div className="form-group">
                        <label>Tên Phòng</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tên nhóm của bạn..." 
                            autoFocus
                            name="roomName"
                        />
                    </div>
                    <div className="user-info-actions">
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setShowAddRoomForm(false)}
                        >
                            Hủy
                        </button>
                        <button type="button" className="btn-save" onClick={onSubmit}>
                            Tạo Phòng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/********************************************************************************/
