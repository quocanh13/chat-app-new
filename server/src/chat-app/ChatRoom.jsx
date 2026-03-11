import {Room, ReceivingMessage, SendingMessage} from "../utils/types.js"
import { useContext, useEffect, useRef, useState } from "react"
import { ChatAppContext } from "./ChatApp.js"
import { addMember as requestAddMember, deleteMember as requestDeleteMember, deleteRoom } from "../request/room.js"
import { createPopUp } from "../utils/popUp/popUp.js"
import { addOnMessageReceive, removeOnMessageReceive, sendMessage as sendMessageRequest} from "../request/socket.js"
import { getFileInformation, getMessageList, sendFile } from "../request/message.js"
import { getUser, leaveRoom } from "../request/user.js"
import { useCurRoomStore, useRoomListStore, useUserStore } from "./chat-app-store.js"
import { useMessageListStore } from "./chat-room-store.js"

/**
 * @param {Object} p
 * @param {Room} p.curRoom 
 */
export default function ChatRoom() {
    /**@type {ReceivingMessage[]} */
    const {curRoom} = useCurRoomStore(o => o)
    const {addMessage} = useMessageListStore(o => o)
    useEffect(()=>{
        function callback(data){
            /**@type {ReceivingMessage} */
            const receivingMessage = data
            if(curRoom.roomID == receivingMessage.roomID) {
                addMessage(receivingMessage)
            }
        }
        addOnMessageReceive(callback)
        return ()=>{
            removeOnMessageReceive(callback)
        }
    }, [curRoom?.roomID])

    if(curRoom == null || curRoom == undefined) {
        return (
            <div></div>
        ) 
    } else {
        return (
            <div>
                <ChatRoomHeader/>
                <MessageList />
                <MessageInput />
            </div>
        )
    }
}

/**
 * @param {Object} p
 * @param {Room} p.curRoom 
 */
function ChatRoomHeader() {
    const {curRoom} = useCurRoomStore(o => o)
    const [showRoomInformation, setShowRoomInformation] = useState(false)

    return (
        <div className="chat-room-header">
            <div className="header-left">
                <div className="room-avatar-container">
                    <img src={"/images/default-room-icon.png"} alt="Room Avatar" className="room-header-avatar" />
                    <span className="status-dot"></span>
                </div>
                <div className="room-header-info">
                    <p className="room-header-name">{curRoom.roomName}</p>
                {/* <span className="room-header-status">Đang hoạt động</span> */}
                </div>
            </div>
            
            <div className="header-right">
                <MessageSearchBar></MessageSearchBar>
                <button className="btn-room-info" onClick={()=>{setShowRoomInformation(true)}}>
                    <img src="/images/room-information-icon.png" alt="Info" />
                </button>
            </div>
            {showRoomInformation && <RoomInformationCard setShowRoomInformation={setShowRoomInformation}/>}
        </div>
    )
}

function MessageSearchBar() {
    const setSearchTerm = useMessageListStore(o => o.setSearchTerm)

    function onChange(e) {
        setSearchTerm(e.target.value)
    }
    return (
        <div className="message-search-container">
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
                        placeholder="Tìm kiếm tin nhắn"
                        onChange={onChange}
                    />
                </div>
            </form>
        </div>
    )
}

/**
 * @param {Object} p
 * @param {ReceivingMessage[]} p.messageList
 * @param {funciton(boolean) : void} p.setReloadMessageList
 */
function MessageList() { 
    const {curRoom} = useCurRoomStore(o => o)
    const {messageList, resetMessageList,loadMessageList, searchTerm} = useMessageListStore(o => o)
    const preScrollHeight = useRef(0)

    useEffect(()=>{
        resetMessageList()
        loadMessageList(curRoom?.roomID)        
    }, [curRoom?.roomID])

    useEffect(()=>{
        const list = document.querySelector(".message-list-container")
        if(list != null) {
            list.scrollTop += (list.scrollHeight - preScrollHeight.current)
            preScrollHeight.current = list.scrollHeight
        }
    }, [messageList])

    const {user} = useUserStore(o => o)
    function onScroll(e) {
        if (e.target.scrollTop === 0) {
            loadMessageList(curRoom.roomID)
        }
    }

    return (
        <div className="message-list-container" onScroll={onScroll}>
            {messageList.slice().reverse().map((v, i) => {
                if(v.file == null) {
                    if(v.message?.includes(searchTerm.toLowerCase())) {
                        const isMe = (user.username == v.username)
                        return <MessageCard message={v} key={v.messageID || i} isMe={isMe} isFile = {v.fileID != undefined}/>;
                    }
                } else {
                    if(v.file.name.includes(searchTerm.toLowerCase())) {
                        const isMe = (user.username == v.username)
                        return <MessageCard message={v} key={v.messageID || i} isMe={isMe} isFile = {v.fileID != undefined}/>;
                    }
                }
            })}
        </div>
    )
}

/**
 * @param {Object} p
 * @param {ReceivingMessage} p.message
 * @param {boolean} p.isMe
 */
function MessageCard({message, isMe, isFile}) {
    const myAvatar = useUserStore(o => o.avatar)
    const [file, setFile] = useState({name : "", size : 0, id : 0})
    const [avatar, setAvatar] = useState("../images/default-user-avatar.png")

    useEffect(()=>{
        if(isFile) {
            getFileInformation(message.fileID).then(res=>{
                if(res.type == "OK") {
                    setFile(res.data)
                } else {
                    createPopUp(res)
                }
            })
        }
    }, [])

    useEffect(()=>{
        getUser(message.username).then(res=>{
            if(res.type == "OK") {
                const avatar = res.data.avatar
                if(avatar) {
                    setAvatar(`/file/${avatar}/view`)
                } 
            }
        })
    }, [])
    return (
        <div className={`message-wrapper ${isMe ? "me" : "them"}`} >
            <img 
                src={isMe ? myAvatar : avatar}
                alt="avatar" 
                className="message-avatar" 
                title={message.username}
            />
            
            <div className="message-content">
                <p className="message-author-name">{message.name}</p>
                <div className="message-bubble" title={message.time}>
                    {
                        isFile ? 
                            <a href={`/file/${file?.id}/download`}>
                                <div className="file-attached-card">
                                    <img src="/images/default-file-icon.png" alt="file" className="file-attached-icon" />
                                    <div className="file-attached-info">
                                        <p className="file-attached-name">{message.file.name}</p>
                                        <p className="file-attached-size">{message.file.size + " KB"}</p>
                                    </div>
                                </div>
                            </a>
                            : <p className="message-text">{message.message}</p>
                    }
                </div>
            </div>
        </div>
    )
}

function MessageInput({setMessageList, setOffset}) {
    const [showFileAttached, setShowFileAttached] = useState(false);
    const {curRoom} = useCurRoomStore(o => o)
    const {user} = useUserStore(o => o)
    const [file, setFile] = useState(null)

    function onClickAttachFile() {
        const fileInput = document.querySelector(".message-input-container input")
        fileInput.click()
    }

    function onAttachFile(e) {
        console.log("ON ATTACH FILE")
        setFile(e.target.files[0])
    }

    async function sendMessage(message) {
        /**@type {SendingMessage} */
        if(message != "") {
            const sendingMessage = {
                message,
                roomID : curRoom?.roomID,
                username : user.username
            }
            sendMessageRequest(sendingMessage)
        }

        if(file != null) {
            const formData = new FormData(document.querySelector(".message-input-container form"))
            setFile(null)
            const res = await sendFile(formData, "MESSAGE", curRoom?.roomID)
            if(res.type == "OK") {
                const sendingMessage = {
                    roomID : curRoom.roomID,
                    username : user.username,
                    fileID : res.data.fileID
                }
                sendMessageRequest(sendingMessage)
                document.querySelector("#file-input").value = "";
            } else {
                createPopUp(res)
            }
        }
    }
    function onSendMessage() {
        const textarea = document.querySelector(".message-input-container textarea")
        sendMessage(textarea.value)
        textarea.value = ""
        textarea.rows = 1
    }
    function onKeyDown(e) {
        // const textArea = document.querySelector(".message-input-container textarea")
        if(e.key == "Enter" && !e.shiftKey) {
            const message = e.target.value
            e.target.value = ""
            e.target.rows = 1
            e.preventDefault()
            sendMessage(message)
        } else if(e.key == "Enter" && e.shiftKey) {
            if(e.target.rows < 5) e.target.rows++
        }
    }
    function onChange(e) {
        const numLine = e.target.value.split("\n").length;
        if(numLine < 5) {
            e.target.rows = numLine
        } 
    }

    return (
        <div className="message-input-container">
            <form action="">
                <input type="file" name="attach" onChange={onAttachFile} id="file-input"/>
            </form>
            {file != null && <FileAttached file={file} setFile={setFile}/>}
            
            <div className="message-input-actions">
                <button className="btn-attach-file" onClick={onClickAttachFile}> 
                    <img src="/images/attach-file-icon.png" alt="" />
                </button>
                <textarea
                    className="message-input-field"
                    placeholder="Nhập tin nhắn..."
                    rows="1"
                    onKeyDown={onKeyDown}
                    onChange={onChange}
                />
                <button className="btn-send-message" onClick={onSendMessage}>
                    <img src="/images/send-message-icon.png" alt="Send" />
                </button>
            </div>
        </div>
    );
}

function FileAttached({file, setFile}) {
    function onClick() {
        setFile(null)
        document.querySelector("#file-input").value = "";
    }
    return (
        <div className="file-attached-wrapper">
            <div className="file-attached-card">
                <img src="/images/default-file-icon.png" alt="file" className="file-attached-icon" />
                <div className="file-attached-info">
                    <p className="file-attached-name">{file.name}</p>
                    <p className="file-attached-size">{file.size + " KB"}</p>
                </div>
                <button className="btn-remove-file" onClick={onClick}>
                    <img src="/images/remove-attached-file-icon.png" alt="remove" />
                </button>
            </div>
        </div>
    )
}

/**
 * @param {Object} p
 * @param {Room} p.room
 * @param {function} p.setShowRoomInformation
 */
function RoomInformationCard({setShowRoomInformation}) {

    const {user} = useUserStore(o => o)
    const {removeRoom} = useRoomListStore(o => o)
    const {curRoom, resetCurRoom} = useCurRoomStore(o => o)

    async function onDeleteRoom() {
        const res = await deleteRoom(curRoom.roomID)
        if(res.type == "OK") {
            setShowRoomInformation(false)
            removeRoom(curRoom.roomID)
            resetCurRoom()
        }
        createPopUp(res)
    }

    async function onLeaveRoom() {
        const res = await leaveRoom(user.username, curRoom.roomID)
        if(res.type == "OK") {
            removeRoom(curRoom.roomID)
            resetCurRoom()
            setShowRoomInformation(false)
        }
        createPopUp(res)
    }

    return (
        <div className="user-info-overlay">
            <div className="room-info-card">
                <h3 className="user-info-title">Thông Tin Phòng</h3>
                
                <div className="room-info-details">
                    <div className="room-info-item">
                        <label>Tên Phòng:</label>
                        <span>{curRoom.roomName}</span>
                    </div>
                    <div className="room-info-item">
                        <label>Số Thành Viên:</label>
                        <span>{curRoom.memberList?.length || 0}</span>
                    </div>
                </div>

                <MemberList memberList={curRoom.memberList || []} showButton={curRoom.host == user.username}/>

                <div className="user-info-actions">
                    <button type="button" className="btn-close" onClick={()=>{setShowRoomInformation(false)}}> Đóng </button>
                    {curRoom.host == user.username && <button type="button" className="btn-delete" onClick={onDeleteRoom}>Xóa Phòng</button>}
                    {curRoom.host != user.username && <button type="button" className="btn-delete" onClick={onLeaveRoom}>Rời Phòng</button>}
                </div>
            </div>
        </div>
    )
}

/**
 * @param {Object} p
 * @param {Member[]} p.memberList
 * @param {boolean} p.showButton
 */
function MemberList({memberList, showButton}) {

    const [showAddMemberForm, setShowAddMemberForm] = useState(false)

    return (
        <div className="member-list-section">
            <div className="member-list-header">
                <h4 className="member-list-title">Danh Sách Thành Viên</h4>
                <button 
                    className="btn-add-member" 
                    onClick={()=>{setShowAddMemberForm(true)}}
                >
                    + Thêm Thành Viên
                </button>
            </div>
            <div className="member-table-wrapper">
                <table className="member-table">
                    <thead>
                        <tr>
                            <th>Họ Và Tên</th>
                            <th>Username</th>
                            <th style={{textAlign: 'center'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memberList.map((member) => (
                            <MemberCard key={member.username} member={member} showButton={showButton}/>
                        ))}
                    </tbody>
                </table>
            </div>
            {showAddMemberForm && <AddMemberForm setShowAddMemberForm={setShowAddMemberForm} />}
        </div>
    )
}

/**
 * @param {Object} p
 * @param {Member} p.member
 * @param {boolean} p.showButton
 */
function MemberCard({member, showButton}) {
    const {curRoom, deleteMember} = useCurRoomStore(o => o)
    const {user} = useUserStore(o => o)

    async function onDeleteMember() {
        const res = await requestDeleteMember(curRoom.roomID, member.username)
        if(res.type == "OK") {
            deleteMember(member.username)
        } 
        createPopUp(res)
    }

    return (
        <tr className="member-row">
            <td>{member.name}</td>
            <td><span className="member-username">@{member.username}</span></td>
            <td style={{textAlign: 'center'}}>
                {(user.username !== member.username && showButton) && (
                    <button className="btn-remove-member" title="Xóa thành viên" onClick={onDeleteMember}>
                        Xóa
                    </button>
                )}
            </td>
        </tr>
    )
}

function AddMemberForm({setShowAddMemberForm}) {

    const {curRoom} = useCurRoomStore(o => o)

    async function onKeyDown(e) {
        if(e.key == "Enter") {
            onSubmit()
            e.preventDefault()
        }
    }

    async function onSubmit() {
        setShowAddMemberForm(false)
        const formData = new FormData(document.querySelector(".add-member-form-container form"))
        const res = await requestAddMember(curRoom.roomID, formData.get("username"))
        createPopUp(res)
    }

    return (
        <div className="modal-overlay">
            <div className="add-member-form-container">
                <form action="">
                    <h3>Thêm Thành Viên Mới</h3>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" placeholder="Nhập username..." onKeyDown={onKeyDown}/>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={()=>{setShowAddMemberForm(false)}}>Hủy</button>
                        <button type="button" className="btn-submit" onClick={onSubmit}>Thêm</button>
                    </div>
                </form>
            </div>
        </div>
    )
}