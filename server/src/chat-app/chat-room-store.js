import {create} from "zustand"
import { getMessageList } from "../request/message.js"

export const useMemberListStore = create((set)=>{
    return {
        memberList: [],

        setMemberList : (memberList)=>{
            set({memberList})
        }
    }
})

export const useMessageListStore = create((set, get) => {
    return {
        messageList : [],
        offset : 0,
        searchTerm: "",

        setMessageList : (messageList) => { set({messageList}) },
        setOffset : (offset) => { set({offset}) },
        setSearchTerm : (searchTerm) => { set({searchTerm}) },

        loadMessageList : async (roomID) => {
            if(typeof roomID == "number") {
                const res = await getMessageList(roomID, get().offset, 20)
                if (res.type === "OK") {
                    set(state => {
                        return {
                            messageList : [...state.messageList, ...res.data],
                            offset : state.offset + res.data.length
                        }
                    });
                }

            } else {
                set({ messageList : [],offset : 0 });
            }            
        },

        addMessage : (message) => {
            set(state => {
                return {
                    messageList : [message, ...state.messageList],
                    offset : state.offset + 1
                }
            })
        },

        resetMessageList : ()=>{
            set({messageList : [], offset : 0})
        }
    }
})