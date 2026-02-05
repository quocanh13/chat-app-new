import { useEffect, createContext } from "react";
import ChatRoom from "./ChatRoom.js";
import Sidebar from "./Sidebar.js";
import { useChatAppStore, useCurRoomStore, useRoomListStore, useUserStore } from "./chat-app-store.js";
import { addOnAdded, addOnNewMember, addOnMemberLeave, addOnDeletedMember } from "../request/socket.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ChatAppContext = /*#__PURE__*/createContext(null);
export default function ChatApp() {
  const user = useUserStore(o => o.user);
  const {
    addRoom,
    getLength,
    addMember,
    deleteMember,
    removeRoom
  } = useRoomListStore(o => o);
  const {
    resetCurRoom
  } = useCurRoomStore(o => o);
  const initializeState = useChatAppStore(o => o.initializeState);
  useEffect(() => {
    initializeState();
    async function onAdded(data) {
      await addRoom(data);
      if (getLength() == 1) resetCurRoom();
    }
    function onNewMember(data) {
      addMember(data.roomID, data.username);
    }
    function onMemberLeave(data) {
      deleteMember(data.roomID, data.username);
    }
    function onDeletedMember(roomID) {
      console.log(roomID);
      if (roomID == useCurRoomStore.getState().curRoom.roomID) createPopUp({
        message: "Bạn đã bị xóa khỏi phòng",
        error: true
      });
      removeRoom(roomID);
    }
    addOnAdded(onAdded);
    addOnNewMember(onNewMember);
    addOnMemberLeave(onMemberLeave);
    addOnDeletedMember(onDeletedMember);
  }, []);
  if (user != null) {
    return /*#__PURE__*/_jsxs("div", {
      className: "chatapp-container",
      children: [/*#__PURE__*/_jsx(Sidebar, {}), /*#__PURE__*/_jsx(ChatRoom, {})]
    });
  } else {
    return /*#__PURE__*/_jsx("div", {});
  }
}