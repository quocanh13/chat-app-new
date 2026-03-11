import { create } from "zustand";
import { getUser } from "../request/user.js";
import { getData } from "../utils/jwt.js";
import cookieParser from "../utils/cookie-parse.js";
import { getRoomInformation, getRoomList } from "../request/room.js";
import { createPopUp } from "../utils/popUp/popUp.js";
export const useUserStore = create((set, get) => {
  return {
    user: null,
    avatar: "../images/default-user-avatar.png",
    setUser: user => {
      set({
        user
      });
    },
    setAvatar: avatar => {
      set({
        avatar
      });
    },
    loadUser: async () => {
      const res = await getUser(getData(cookieParser(document.cookie).token).username);
      if (res.type == "OK") {
        let avatar = get().avatar;
        if (res.data.avatar != null && res.data.avatar != undefined) avatar = `/file/${res.data.avatar}/view`;
        set({
          user: res.data,
          avatar
        });
      } else {
        createPopUp(res);
      }
      return res.data;
    }
  };
});
export const useRoomListStore = create((set, get) => {
  return {
    roomList: [],
    setRoomList: roomList => {
      set({
        roomList
      });
    },
    removeRoom: (roomID, isDeleted = false) => {
      const {
        curRoom,
        resetCurRoom
      } = useCurRoomStore.getState();
      set(state => {
        return {
          roomList: state.roomList.filter(r => {
            if (isDeleted && r.roomID == roomID) {
              createPopUp({
                message: `Bạn vừa bị xóa khỏi phòng "${r.roomName}"`,
                error: true
              });
            }
            return r.roomID != roomID;
          })
        };
      });
      if (roomID == curRoom.roomID) resetCurRoom();
    },
    addRoom: async (roomID, isAdded = false) => {
      const res = await getRoomInformation(roomID);
      if (res.type == "OK") {
        if (isAdded) {
          createPopUp({
            message: `Bạn vừa được thêm vào phòng "${res.data.roomName}"`,
            error: false
          });
        }
        set(state => {
          return {
            roomList: [...state.roomList, res.data]
          };
        });
      }
    },
    getLength: () => {
      return get().roomList.length;
    },
    addMember: async (roomID, username) => {
      const roomList = get().roomList;
      const {
        curRoom,
        addMember
      } = useCurRoomStore.getState();
      for (let i = 0; i < roomList.length; i++) {
        if (roomID == roomList[i].roomID) {
          const member = (await getUser(username)).data;
          if (curRoom.roomID == roomID) addMember(member);else roomList[i].memberList.push(member);
          return;
        }
      }
    },
    deleteMember: (roomID, username) => {
      const roomList = get().roomList;
      const {
        curRoom,
        deleteMember
      } = useCurRoomStore.getState();
      for (let i = 0; i < roomList.length; i++) {
        if (roomID == roomList[i].roomID) {
          if (curRoom.roomID == roomID) deleteMember(username);else {
            roomList[i].memberList = roomList[i].memberList.filter(m => {
              if (m.username == username) {
                return false;
              } else return true;
            });
          }
        }
      }
    },
    loadRoomList: async user => {
      const res = await getRoomList(user.username);
      if (res.type == "OK") {
        set({
          roomList: res.data
        });
      } else {
        createPopUp(res);
      }
      return res.data ?? [];
    }
  };
});
export const useCurRoomStore = create((set, get) => {
  return {
    curRoom: null,
    setCurRoom: curRoom => {
      set({
        curRoom
      });
    },
    resetCurRoom: () => {
      let curRoom = useRoomListStore.getState().roomList;
      curRoom = curRoom.length == 0 ? null : curRoom[0];
      set({
        curRoom
      });
    },
    deleteMember: username => {
      if (get().curRoom != null) {
        set(state => {
          const memberList = state.curRoom.memberList.filter(r => r.username !== username);
          const curRoom = {
            roomID: state.curRoom.roomID,
            roomName: state.curRoom.roomName,
            avatar: state.curRoom.avatar,
            host: state.curRoom.host,
            memberList
          };
          return {
            curRoom
          };
        });
      }
    },
    addMember: member => {
      if (get().curRoom != null) {
        set(state => {
          const memberList = [...state.curRoom.memberList, member];
          const curRoom = {
            roomID: state.curRoom.roomID,
            roomName: state.curRoom.roomName,
            avatar: state.curRoom.avatar,
            host: state.curRoom.host,
            memberList
          };
          return {
            curRoom
          };
        });
      }
    }
  };
});
export const useChatAppStore = create(() => {
  return {
    initializeState: async () => {
      const loadUser = useUserStore.getState().loadUser;
      const loadRoomList = useRoomListStore.getState().loadRoomList;
      const setCurRoom = useCurRoomStore.getState().setCurRoom;
      const user = await loadUser();
      if (user == null) return;
      const roomList = await loadRoomList(user);
      if (roomList.length == 0) return;
      setCurRoom(roomList[0]);
    }
  };
});