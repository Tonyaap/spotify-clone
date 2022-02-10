import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  PlusCircleIcon,
  RssIcon,
  MusicNoteIcon
} from '@heroicons/react/outline'
import { HeartIcon } from '@heroicons/react/solid'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import useSpotify from '../hooks/useSpotify'
import { playlistIdState } from '../atoms/playlistAtom'

function Sidebar() {
  const spotifyApi = useSpotify()
  const { data: session, status } = useSession()
  const [playLists, setPlaylists] = useState([])
  const [playlistId, setPlaylistId] = useRecoilState(playlistIdState)

  console.log('you picked playlist>>>', playlistId)

  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      spotifyApi.getUserPlaylists().then((data) => {
        setPlaylists(data.body.items)
      })
    }
  }, [session, spotifyApi])

  const hipHop = playLists.find(element => element.name === "Guess The Song - HipHop");
  const classicRock = playLists.find(element => element.name === "Guess The Song - Classic Rock");
  const electronic = playLists.find(element => element.name === "Guess The Song - Electronic");

  const guessLists = [
    hipHop,
    classicRock,
     electronic,
  ]

  return (
    <div
      className="
    sm:max-w[12rem] hidden h-screen overflow-y-scroll border-r border-gray-900
    p-5 text-xs text-gray-500 scrollbar-hide md:inline-flex lg:max-w-[15rem] lg:text-sm"
    >
      <div className="space-y-4">
        <button className="flex items-center space-x-2 hover:text-white">
          <MusicNoteIcon className="h-5 w-5" />
          <p>Reverse Shazam</p>
        </button>
        <hr className="border-t-[0.1px] border-gray-900" />

        {/* Playlists  */}

      {guessLists &&

        guessLists.map((playlist) => (
          <p
            key={playlist?.id}
            onClick={() => setPlaylistId(playlist?.id)}
            className="cursor-pointer hover:text-white"
          >
            {playlist?.name}
          </p>
        ))
         }
      </div>
    </div>
  )
}

export default Sidebar
