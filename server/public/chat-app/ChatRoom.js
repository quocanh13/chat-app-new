import { Room, ReceivingMessage, SendingMessage } from "../utils/types.js";
import { useContext, useEffect, useRef, useState } from "react";
import { ChatAppContext } from "./ChatApp.js";
import { addMember as requestAddMember, deleteMember as requestDeleteMember, deleteRoom } from "../request/room.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { addOnMessageReceive, removeOnMessageReceive, sendMessage as sendMessageRequest } from "../request/socket.js";
import { getFileInformation, getMessageList, sendFile } from "../request/message.js";
import { getUser, leaveRoom } from "../request/user.js";
import { useCurRoomStore, useRoomListStore, useUserStore } from "./chat-app-store.js";
import { useMessageListStore } from "./chat-room-store.js";

/**
 * @param {Object} p
 * @param {Room} p.curRoom 
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ChatRoom() {
  /**@type {ReceivingMessage[]} */
  const {
    curRoom
  } = useCurRoomStore(o => o);
  const {
    addMessage
  } = useMessageListStore(o => o);
  useEffect(() => {
    function callback(data) {
      /**@type {ReceivingMessage} */
      const receivingMessage = data;
      if (curRoom.roomID == receivingMessage.roomID) {
        addMessage(receivingMessage);
      }
    }
    addOnMessageReceive(callback);
    return () => {
      removeOnMessageReceive(callback);
    };
  }, [curRoom?.roomID]);
  if (curRoom == null || curRoom == undefined) {
    return /*#__PURE__*/_jsx("div", {});
  } else {
    return /*#__PURE__*/_jsxs("div", {
      children: [/*#__PURE__*/_jsx(ChatRoomHeader, {}), /*#__PURE__*/_jsx(MessageList, {}), /*#__PURE__*/_jsx(MessageInput, {})]
    });
  }
}

/**
 * @param {Object} p
 * @param {Room} p.curRoom 
 */
function ChatRoomHeader() {
  const {
    curRoom
  } = useCurRoomStore(o => o);
  const [showRoomInformation, setShowRoomInformation] = useState(false);
  return /*#__PURE__*/_jsxs("div", {
    className: "chat-room-header",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "header-left",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "room-avatar-container",
        children: [/*#__PURE__*/_jsx("img", {
          src: "/images/default-room-icon.png",
          alt: "Room Avatar",
          className: "room-header-avatar"
        }), /*#__PURE__*/_jsx("span", {
          className: "status-dot"
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "room-header-info",
        children: /*#__PURE__*/_jsx("p", {
          className: "room-header-name",
          children: curRoom.roomName
        })
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "header-right",
      children: [/*#__PURE__*/_jsx(MessageSearchBar, {}), /*#__PURE__*/_jsx("button", {
        className: "btn-room-info",
        onClick: () => {
          setShowRoomInformation(true);
        },
        children: /*#__PURE__*/_jsx("img", {
          src: "/images/room-information-icon.png",
          alt: "Info"
        })
      })]
    }), showRoomInformation && /*#__PURE__*/_jsx(RoomInformationCard, {
      setShowRoomInformation: setShowRoomInformation
    })]
  });
}
function MessageSearchBar() {
  const setSearchTerm = useMessageListStore(o => o.setSearchTerm);
  function onChange(e) {
    setSearchTerm(e.target.value);
  }
  return /*#__PURE__*/_jsx("div", {
    className: "message-search-container",
    children: /*#__PURE__*/_jsx("form", {
      className: "search-form",
      children: /*#__PURE__*/_jsxs("div", {
        className: "search-input-wrapper",
        children: [/*#__PURE__*/_jsx("img", {
          src: "/images/search-bar-icon.png",
          alt: "search",
          className: "search-icon"
        }), /*#__PURE__*/_jsx("input", {
          type: "text",
          name: "room-name",
          className: "search-input",
          placeholder: "T\xECm ki\u1EBFm tin nh\u1EAFn",
          onChange: onChange
        })]
      })
    })
  });
}

/**
 * @param {Object} p
 * @param {ReceivingMessage[]} p.messageList
 * @param {funciton(boolean) : void} p.setReloadMessageList
 */
function MessageList() {
  const {
    curRoom
  } = useCurRoomStore(o => o);
  const {
    messageList,
    resetMessageList,
    loadMessageList,
    searchTerm
  } = useMessageListStore(o => o);
  const preScrollHeight = useRef(0);
  useEffect(() => {
    resetMessageList();
    loadMessageList(curRoom?.roomID);
  }, [curRoom?.roomID]);
  useEffect(() => {
    const list = document.querySelector(".message-list-container");
    if (list != null) {
      list.scrollTop += list.scrollHeight - preScrollHeight.current;
      preScrollHeight.current = list.scrollHeight;
    }
  }, [messageList]);
  const {
    user
  } = useUserStore(o => o);
  function onScroll(e) {
    if (e.target.scrollTop === 0) {
      loadMessageList(curRoom.roomID);
    }
  }
  return /*#__PURE__*/_jsx("div", {
    className: "message-list-container",
    onScroll: onScroll,
    children: messageList.slice().reverse().map((v, i) => {
      if (v.file == null) {
        if (v.message?.includes(searchTerm.toLowerCase())) {
          const isMe = user.username == v.username;
          return /*#__PURE__*/_jsx(MessageCard, {
            message: v,
            isMe: isMe,
            isFile: v.fileID != undefined
          }, v.messageID || i);
        }
      } else {
        if (v.file.name.includes(searchTerm.toLowerCase())) {
          const isMe = user.username == v.username;
          return /*#__PURE__*/_jsx(MessageCard, {
            message: v,
            isMe: isMe,
            isFile: v.fileID != undefined
          }, v.messageID || i);
        }
      }
    })
  });
}

/**
 * @param {Object} p
 * @param {ReceivingMessage} p.message
 * @param {boolean} p.isMe
 */
function MessageCard({
  message,
  isMe,
  isFile
}) {
  const myAvatar = useUserStore(o => o.avatar);
  const [file, setFile] = useState({
    name: "",
    size: 0,
    id: 0
  });
  const [avatar, setAvatar] = useState("../images/default-user-avatar.png");
  useEffect(() => {
    if (isFile) {
      getFileInformation(message.fileID).then(res => {
        if (res.type == "OK") {
          setFile(res.data);
        } else {
          createPopUp(res);
        }
      });
    }
  }, []);
  useEffect(() => {
    getUser(message.username).then(res => {
      if (res.type == "OK") {
        const avatar = res.data.avatar;
        if (avatar) {
          setAvatar(`/file/${avatar}/view`);
        }
      }
    });
  }, []);
  return /*#__PURE__*/_jsxs("div", {
    className: `message-wrapper ${isMe ? "me" : "them"}`,
    children: [/*#__PURE__*/_jsx("img", {
      src: isMe ? myAvatar : avatar,
      alt: "avatar",
      className: "message-avatar",
      title: message.username
    }), /*#__PURE__*/_jsxs("div", {
      className: "message-content",
      children: [/*#__PURE__*/_jsx("p", {
        className: "message-author-name",
        children: message.name
      }), /*#__PURE__*/_jsx("div", {
        className: "message-bubble",
        title: message.time,
        children: isFile ? /*#__PURE__*/_jsx("a", {
          href: `/file/${file?.id}/download`,
          children: /*#__PURE__*/_jsxs("div", {
            className: "file-attached-card",
            children: [/*#__PURE__*/_jsx("img", {
              src: "/images/default-file-icon.png",
              alt: "file",
              className: "file-attached-icon"
            }), /*#__PURE__*/_jsxs("div", {
              className: "file-attached-info",
              children: [/*#__PURE__*/_jsx("p", {
                className: "file-attached-name",
                children: message.file.name
              }), /*#__PURE__*/_jsx("p", {
                className: "file-attached-size",
                children: message.file.size + " KB"
              })]
            })]
          })
        }) : /*#__PURE__*/_jsx("p", {
          className: "message-text",
          children: message.message
        })
      })]
    })]
  });
}
function MessageInput({
  setMessageList,
  setOffset
}) {
  const [showFileAttached, setShowFileAttached] = useState(false);
  const {
    curRoom
  } = useCurRoomStore(o => o);
  const {
    user
  } = useUserStore(o => o);
  const [file, setFile] = useState(null);
  function onClickAttachFile() {
    const fileInput = document.querySelector(".message-input-container input");
    fileInput.click();
  }
  function onAttachFile(e) {
    setFile(e.target.files[0]);
  }
  async function sendMessage(message) {
    /**@type {SendingMessage} */
    if (message != "") {
      const sendingMessage = {
        message,
        roomID: curRoom?.roomID,
        username: user.username
      };
      sendMessageRequest(sendingMessage);
    }
    if (file != null) {
      const formData = new FormData(document.querySelector(".message-input-container form"));
      setFile(null);
      const res = await sendFile(formData, "MESSAGE", curRoom?.roomID);
      if (res.type == "OK") {
        const sendingMessage = {
          roomID: curRoom.roomID,
          username: user.username,
          fileID: res.data.fileID
        };
        sendMessageRequest(sendingMessage);
      } else {
        createPopUp(res);
      }
    }
  }
  function onSendMessage() {
    const textarea = document.querySelector(".message-input-container textarea");
    sendMessage(textarea.value);
    textarea.value = "";
    textarea.rows = 1;
  }
  function onKeyDown(e) {
    // const textArea = document.querySelector(".message-input-container textarea")
    if (e.key == "Enter" && !e.shiftKey) {
      const message = e.target.value;
      e.target.value = "";
      e.target.rows = 1;
      e.preventDefault();
      sendMessage(message);
    } else if (e.key == "Enter" && e.shiftKey) {
      if (e.target.rows < 5) e.target.rows++;
    }
  }
  function onChange(e) {
    const numLine = e.target.value.split("\n").length;
    if (numLine < 5) {
      e.target.rows = numLine;
    }
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "message-input-container",
    children: [/*#__PURE__*/_jsx("form", {
      action: "",
      children: /*#__PURE__*/_jsx("input", {
        type: "file",
        name: "attach",
        onChange: onAttachFile
      })
    }), file != null && /*#__PURE__*/_jsx(FileAttached, {
      file: file,
      setFile: setFile
    }), /*#__PURE__*/_jsxs("div", {
      className: "message-input-actions",
      children: [/*#__PURE__*/_jsx("button", {
        className: "btn-attach-file",
        onClick: onClickAttachFile,
        children: /*#__PURE__*/_jsx("img", {
          src: "/images/attach-file-icon.png",
          alt: ""
        })
      }), /*#__PURE__*/_jsx("textarea", {
        className: "message-input-field",
        placeholder: "Nh\u1EADp tin nh\u1EAFn...",
        rows: "1",
        onKeyDown: onKeyDown,
        onChange: onChange
      }), /*#__PURE__*/_jsx("button", {
        className: "btn-send-message",
        onClick: onSendMessage,
        children: /*#__PURE__*/_jsx("img", {
          src: "/images/send-message-icon.png",
          alt: "Send"
        })
      })]
    })]
  });
}
function FileAttached({
  file,
  setFile
}) {
  return /*#__PURE__*/_jsx("div", {
    className: "file-attached-wrapper",
    children: /*#__PURE__*/_jsxs("div", {
      className: "file-attached-card",
      children: [/*#__PURE__*/_jsx("img", {
        src: "/images/default-file-icon.png",
        alt: "file",
        className: "file-attached-icon"
      }), /*#__PURE__*/_jsxs("div", {
        className: "file-attached-info",
        children: [/*#__PURE__*/_jsx("p", {
          className: "file-attached-name",
          children: file.name
        }), /*#__PURE__*/_jsx("p", {
          className: "file-attached-size",
          children: file.size + " KB"
        })]
      }), /*#__PURE__*/_jsx("button", {
        className: "btn-remove-file",
        onClick: () => {
          setFile(null);
        },
        children: /*#__PURE__*/_jsx("img", {
          src: "/images/remove-attached-file-icon.png",
          alt: "remove"
        })
      })]
    })
  });
}

/**
 * @param {Object} p
 * @param {Room} p.room
 * @param {function} p.setShowRoomInformation
 */
function RoomInformationCard({
  setShowRoomInformation
}) {
  const {
    user
  } = useUserStore(o => o);
  const {
    removeRoom
  } = useRoomListStore(o => o);
  const {
    curRoom,
    resetCurRoom
  } = useCurRoomStore(o => o);
  async function onDeleteRoom() {
    const res = await deleteRoom(curRoom.roomID);
    if (res.type == "OK") {
      setShowRoomInformation(false);
      removeRoom(curRoom.roomID);
      resetCurRoom();
    }
    createPopUp(res);
  }
  async function onLeaveRoom() {
    const res = await leaveRoom(user.username, curRoom.roomID);
    if (res.type == "OK") {
      removeRoom(curRoom.roomID);
      resetCurRoom();
      setShowRoomInformation(false);
    }
    createPopUp(res);
  }
  return /*#__PURE__*/_jsx("div", {
    className: "user-info-overlay",
    children: /*#__PURE__*/_jsxs("div", {
      className: "room-info-card",
      children: [/*#__PURE__*/_jsx("h3", {
        className: "user-info-title",
        children: "Th\xF4ng Tin Nh\xF3m"
      }), /*#__PURE__*/_jsxs("div", {
        className: "room-info-details",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "room-info-item",
          children: [/*#__PURE__*/_jsx("label", {
            children: "T\xEAn Ph\xF2ng:"
          }), /*#__PURE__*/_jsx("span", {
            children: curRoom.roomName
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "room-info-item",
          children: [/*#__PURE__*/_jsx("label", {
            children: "S\u1ED1 Th\xE0nh Vi\xEAn:"
          }), /*#__PURE__*/_jsx("span", {
            children: curRoom.memberList?.length || 0
          })]
        })]
      }), /*#__PURE__*/_jsx(MemberList, {
        memberList: curRoom.memberList || [],
        showButton: curRoom.host == user.username
      }), /*#__PURE__*/_jsxs("div", {
        className: "user-info-actions",
        children: [/*#__PURE__*/_jsx("button", {
          type: "button",
          className: "btn-close",
          onClick: () => {
            setShowRoomInformation(false);
          },
          children: " \u0110\xF3ng "
        }), curRoom.host == user.username && /*#__PURE__*/_jsx("button", {
          type: "button",
          className: "btn-delete",
          onClick: onDeleteRoom,
          children: "X\xF3a Ph\xF2ng"
        }), curRoom.host != user.username && /*#__PURE__*/_jsx("button", {
          type: "button",
          className: "btn-delete",
          onClick: onLeaveRoom,
          children: "R\u1EDDi Ph\xF2ng"
        })]
      })]
    })
  });
}

/**
 * @param {Object} p
 * @param {Member[]} p.memberList
 * @param {boolean} p.showButton
 */
function MemberList({
  memberList,
  showButton
}) {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  return /*#__PURE__*/_jsxs("div", {
    className: "member-list-section",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "member-list-header",
      children: [/*#__PURE__*/_jsx("h4", {
        className: "member-list-title",
        children: "Danh S\xE1ch Th\xE0nh Vi\xEAn"
      }), /*#__PURE__*/_jsx("button", {
        className: "btn-add-member",
        onClick: () => {
          setShowAddMemberForm(true);
        },
        children: "+ Th\xEAm Th\xE0nh Vi\xEAn"
      })]
    }), /*#__PURE__*/_jsx("div", {
      className: "member-table-wrapper",
      children: /*#__PURE__*/_jsxs("table", {
        className: "member-table",
        children: [/*#__PURE__*/_jsx("thead", {
          children: /*#__PURE__*/_jsxs("tr", {
            children: [/*#__PURE__*/_jsx("th", {
              children: "H\u1ECD V\xE0 T\xEAn"
            }), /*#__PURE__*/_jsx("th", {
              children: "Username"
            }), /*#__PURE__*/_jsx("th", {
              style: {
                textAlign: 'center'
              },
              children: "H\xE0nh \u0111\u1ED9ng"
            })]
          })
        }), /*#__PURE__*/_jsx("tbody", {
          children: memberList.map(member => /*#__PURE__*/_jsx(MemberCard, {
            member: member,
            showButton: showButton
          }, member.username))
        })]
      })
    }), showAddMemberForm && /*#__PURE__*/_jsx(AddMemberForm, {
      setShowAddMemberForm: setShowAddMemberForm
    })]
  });
}

/**
 * @param {Object} p
 * @param {Member} p.member
 * @param {boolean} p.showButton
 */
function MemberCard({
  member,
  showButton
}) {
  const {
    curRoom,
    deleteMember
  } = useCurRoomStore(o => o);
  const {
    user
  } = useUserStore(o => o);
  async function onDeleteMember() {
    const res = await requestDeleteMember(curRoom.roomID, member.username);
    if (res.type == "OK") {
      deleteMember(member.username);
    }
    createPopUp(res);
  }
  return /*#__PURE__*/_jsxs("tr", {
    className: "member-row",
    children: [/*#__PURE__*/_jsx("td", {
      children: member.name
    }), /*#__PURE__*/_jsx("td", {
      children: /*#__PURE__*/_jsxs("span", {
        className: "member-username",
        children: ["@", member.username]
      })
    }), /*#__PURE__*/_jsx("td", {
      style: {
        textAlign: 'center'
      },
      children: user.username !== member.username && showButton && /*#__PURE__*/_jsx("button", {
        className: "btn-remove-member",
        title: "X\xF3a th\xE0nh vi\xEAn",
        onClick: onDeleteMember,
        children: "X\xF3a"
      })
    })]
  });
}
function AddMemberForm({
  setShowAddMemberForm
}) {
  const {
    curRoom
  } = useCurRoomStore(o => o);
  async function onKeyDown(e) {
    if (e.key == "Enter") {
      onSubmit();
      e.preventDefault();
    }
  }
  async function onSubmit() {
    setShowAddMemberForm(false);
    const formData = new FormData(document.querySelector(".add-member-form-container form"));
    const res = await requestAddMember(curRoom.roomID, formData.get("username"));
    createPopUp(res);
  }
  return /*#__PURE__*/_jsx("div", {
    className: "modal-overlay",
    children: /*#__PURE__*/_jsx("div", {
      className: "add-member-form-container",
      children: /*#__PURE__*/_jsxs("form", {
        action: "",
        children: [/*#__PURE__*/_jsx("h3", {
          children: "Th\xEAm Th\xE0nh Vi\xEAn M\u1EDBi"
        }), /*#__PURE__*/_jsx("label", {
          htmlFor: "username",
          children: "Username"
        }), /*#__PURE__*/_jsx("input", {
          type: "text",
          name: "username",
          id: "username",
          placeholder: "Nh\u1EADp username...",
          onKeyDown: onKeyDown
        }), /*#__PURE__*/_jsxs("div", {
          className: "form-actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            className: "btn-cancel",
            onClick: () => {
              setShowAddMemberForm(false);
            },
            children: "H\u1EE7y"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            className: "btn-submit",
            onClick: onSubmit,
            children: "Th\xEAm"
          })]
        })]
      })
    })
  });
}