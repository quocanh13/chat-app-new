import { useContext, useEffect, useState } from "react";
import { Member, Room, User } from "../utils/types.js";
import Loading from "./Loading.js";
import { ChatAppContext } from "./ChatApp.js";
import { getLatestMessage, postRoom } from "../request/room.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { sendFile } from "../request/message.js";
import { updateAvatar, updateUserInformation } from "../request/user.js";
import { isImage } from "../utils/checkFileType.js";
import { addNewRoom, addOnMessageReceive, removeOnMessageReceive } from "../request/socket.js";
import { useCurRoomStore, useRoomListStore, useUserStore } from "./chat-app-store.js";

/*******************************  Sidebar ***************************************/
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export default function Sidebar() {
  const {
    roomList
  } = useRoomListStore.getState();
  const [searchTerm, setSearchTerm] = useState("");
  return /*#__PURE__*/_jsxs("div", {
    children: [/*#__PURE__*/_jsx(SidebarHeader, {}), /*#__PURE__*/_jsx(RoomSearchBar, {
      searchTerm: searchTerm,
      setSearchTerm: setSearchTerm
    }), roomList == null ? /*#__PURE__*/_jsx(Loading, {}) : /*#__PURE__*/_jsx(RoomList, {
      searchTerm: searchTerm
    })]
  });
}

/**
 * @param {Object} p 
 * @param {string} p.userAvatar
 */
function SidebarHeader() {
  const {
    user,
    avatar
  } = useUserStore(o => o);
  const [showUserInformation, setShowUserInformation] = useState(false);
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  return /*#__PURE__*/_jsxs("div", {
    className: "sidebar-header",
    children: [/*#__PURE__*/_jsx("h3", {
      className: "sidebar-title",
      children: "\u0110o\u1EA1n Chat"
    }), /*#__PURE__*/_jsxs("div", {
      className: "sidebar-actions",
      children: [/*#__PURE__*/_jsx("div", {
        className: "avatar-wrapper",
        children: /*#__PURE__*/_jsx("img", {
          src: avatar,
          alt: "User Avatar",
          className: "user-avatar",
          onClick: () => {
            setShowUserInformation(true);
          }
        })
      }), /*#__PURE__*/_jsx("button", {
        className: "btn-new-room",
        onClick: () => {
          setShowAddRoomForm(true);
        },
        children: /*#__PURE__*/_jsx("img", {
          src: "../images/new-room-icon.png",
          alt: "New Room"
        })
      })]
    }), showUserInformation && /*#__PURE__*/_jsx(UserInformationCard, {
      setShowUserInformation: setShowUserInformation
    }), showAddRoomForm && /*#__PURE__*/_jsx(AddRoomForm, {
      setShowAddRoomForm: setShowAddRoomForm
    })]
  });
}
function RoomSearchBar({
  searchTerm,
  setSearchTerm
}) {
  function onChange(e) {
    setSearchTerm(e.target.value);
  }
  return /*#__PURE__*/_jsx("div", {
    className: "room-search-container",
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
          placeholder: "Nh\u1EADp t\xEAn ph\xF2ng \u0111\u1EC3 t\xECm ki\u1EBFm",
          onChange: onChange
        })]
      })
    })
  });
}

/**
 * @param {Object} p
 * @param {Room[]} p.roomList
 */
function RoomList({
  searchTerm
}) {
  const {
    roomList
  } = useRoomListStore(o => o);
  return /*#__PURE__*/_jsx("div", {
    className: "room-list-container",
    children: roomList.map((v, i) => {
      if (v.roomName.includes(searchTerm.toLowerCase())) return /*#__PURE__*/_jsx(RoomListCard, {
        room: v
      }, v.roomID);
    })
  });
}

/**
 * @param {Object} p
 * @param {Room} p.room
 */
function RoomListCard({
  room
}) {
  const {
    curRoom,
    setCurRoom
  } = useCurRoomStore(o => o);
  const [latestMessage, setLatestMessage] = useState({
    name: "",
    message: "Phòng mới được tạo",
    isNew: true
  });
  useEffect(() => {
    function callback(data) {
      const message = data;
      message.isNew = true;
      if (message.roomID == room.roomID) {
        setLatestMessage(message);
      }
    }
    addOnMessageReceive(callback);
    getLatestMessage(room.roomID).then(res => {
      if (res.type == "OK") {
        setLatestMessage(res.data);
      }
    });
    return () => {
      removeOnMessageReceive(callback);
    };
  }, []);
  if (curRoom == null) return /*#__PURE__*/_jsx(_Fragment, {});
  let isCurRoom = "";
  if (curRoom.roomID == room.roomID) {
    isCurRoom = "cur-room";
    latestMessage.isNew = false;
  }
  console.log(room.roomID + " " + latestMessage.isNew);
  return /*#__PURE__*/_jsxs("div", {
    className: `room-card ${isCurRoom}`,
    onClick: () => {
      setCurRoom(room);
    },
    children: [/*#__PURE__*/_jsx("div", {
      className: "room-avatar-wrapper",
      children: /*#__PURE__*/_jsx("img", {
        src: "/images/default-room-icon.png",
        alt: "room",
        className: "room-avatar"
      })
    }), /*#__PURE__*/_jsxs("div", {
      className: "room-info",
      children: [/*#__PURE__*/_jsx("div", {
        className: "room-name",
        children: room.roomName
      }), /*#__PURE__*/_jsxs("div", {
        className: "room-latest-msg",
        children: [/*#__PURE__*/_jsxs("span", {
          className: "msg-author" + (latestMessage.isNew ? " new-message" : ""),
          children: [latestMessage.name, " "]
        }), /*#__PURE__*/_jsx("span", {
          className: "msg-text" + (latestMessage.isNew ? " new-message" : ""),
          children: ": " + (latestMessage.message ?? latestMessage.file?.name)
        })]
      })]
    })]
  });
}

/**
 * @param {Object} p
 * @param {function() : void} p.setShowUserInformation
 */
function UserInformationCard({
  setShowUserInformation
}) {
  const {
    user,
    avatar,
    setAvatar
  } = useUserStore(o => o);
  function onChangeAvatarClick() {
    const input = document.querySelector("#attach-avatar");
    input.click();
  }
  function onChangeInput(e) {
    if (isImage(e.target.files[0].type)) {
      document.querySelector(".user-info-card img").src = URL.createObjectURL(e.target.files[0]);
    } else {
      createPopUp({
        message: "File phải là file ảnh",
        error: true
      });
    }
  }
  async function onSubmit() {
    setShowUserInformation(false);
    const formData = new FormData(document.querySelector(".user-info-form"));
    const file = formData.get("avatar");
    if (file.size != 0 && isImage(file.type)) {
      const avatarRes = await updateAvatar(formData, user.username);
      if (avatarRes.type != "OK") {
        createPopUp(avatarRes);
        return;
      } else {
        setAvatar(`/file/${avatarRes.data.avatar}/view`);
      }
    }
    const userRes = await updateUserInformation(formData.get("username"), formData.get("password"), formData.get("name"));
    if (userRes.type != "OK") {
      createPopUp(userRes);
      return;
    }
    createPopUp({
      message: "Bạn đã cập nhật thông tin thành công",
      error: false
    });
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "user-info-overlay",
    children: [" ", /*#__PURE__*/_jsxs("div", {
      className: "user-info-card",
      children: [/*#__PURE__*/_jsx("h3", {
        className: "user-info-title",
        children: "Th\xF4ng Tin Ng\u01B0\u1EDDi D\xF9ng"
      }), /*#__PURE__*/_jsx("img", {
        src: avatar,
        alt: "",
        onClick: onChangeAvatarClick
      }), /*#__PURE__*/_jsxs("form", {
        className: "user-info-form",
        children: [/*#__PURE__*/_jsx("input", {
          type: "file",
          name: "avatar",
          id: "attach-avatar",
          onChange: onChangeInput
        }), /*#__PURE__*/_jsxs("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsx("label", {
            children: "Username"
          }), /*#__PURE__*/_jsx("input", {
            type: "text",
            name: "username",
            value: user.username,
            onChange: e => {
              e.target.value;
            }
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsx("label", {
            children: "Password"
          }), /*#__PURE__*/_jsx("input", {
            type: "text",
            name: "password",
            placeholder: user.password
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsx("label", {
            children: "Name"
          }), /*#__PURE__*/_jsx("input", {
            type: "text",
            name: "name",
            placeholder: user.name
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "user-info-actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            className: "btn-close",
            onClick: () => {
              setShowUserInformation(false);
            },
            children: "\u0110\xF3ng"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            className: "btn-save",
            onClick: onSubmit,
            children: "L\u01B0u"
          })]
        })]
      })]
    })]
  });
}

/**
 * @param {Object} p
 * @param {function() : void} p.setShowAddRoomForm
 */
function AddRoomForm({
  setShowAddRoomForm
}) {
  const {
    roomList,
    setRoomList
  } = useRoomListStore(o => o);
  const {
    curRoom,
    resetCurRoom
  } = useCurRoomStore(o => o);
  async function onSubmit() {
    setShowAddRoomForm(false);
    const formData = new FormData(document.querySelector(".add-room-card .user-info-form"));
    const res = await postRoom(formData.get("roomName"));
    if (res.type == "OK") {
      // console.log([...roomList, res.data])
      setRoomList([...roomList, res.data]);
      addNewRoom(res.data.roomID);
      if (curRoom == null) resetCurRoom();
    }
    createPopUp(res);
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "user-info-overlay",
    children: [" ", /*#__PURE__*/_jsxs("div", {
      className: "add-room-card",
      children: [/*#__PURE__*/_jsx("h3", {
        className: "user-info-title",
        children: "T\u1EA1o Nh\xF3m M\u1EDBi"
      }), /*#__PURE__*/_jsxs("form", {
        className: "user-info-form",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsx("label", {
            children: "T\xEAn Ph\xF2ng"
          }), /*#__PURE__*/_jsx("input", {
            type: "text",
            placeholder: "Nh\u1EADp t\xEAn nh\xF3m c\u1EE7a b\u1EA1n...",
            autoFocus: true,
            name: "roomName"
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "user-info-actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            className: "btn-close",
            onClick: () => setShowAddRoomForm(false),
            children: "H\u1EE7y"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            className: "btn-save",
            onClick: onSubmit,
            children: "T\u1EA1o Ph\xF2ng"
          })]
        })]
      })]
    })]
  });
}

/********************************************************************************/