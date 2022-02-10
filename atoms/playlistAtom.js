import {atom} from 'recoil'

export const playlistState = atom({
    key:"playlistState",
    default: null,
})

export const playlistIdState = atom({
    key: "playlistIdState",
    default: '6ZUqkZRtvRhgDajQDLMsnt'
})

export const correctState = atom({
    key: 'correctState',
    default: false,
})

export const titleState = atom({
    key: "titleState",
    default: ""
})
