import { ChevronDownIcon } from '@heroicons/react/outline'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { shuffle } from 'lodash'
import { useRecoilState, useRecoilValue } from 'recoil'
import { playlistIdState, playlistState } from '../atoms/playlistAtom'
import useSpotify from '../hooks/useSpotify'
import Songs from '../components/Songs'

const colors = [
  'from-indigo-500',
  'from-blue-500',
  'from-green-500',
  'from-red-500',
  'from-yellow-500',
  'from-pink-500',
  'from-purple-500',
]

function Center() {
  const { data: session } = useSession()
  const spotifyApi = useSpotify()
  const [color, setColor] = useState(null)
  const playlistId = useRecoilValue(playlistIdState)
  const [playlist, setPlaylist] = useRecoilState(playlistState)

  useEffect(() => {
    setColor(shuffle(colors).pop());
  }, [playlistId])

  useEffect(() => {
    spotifyApi
    .getPlaylist(playlistId)
    .then((data) => {
      setPlaylist(data.body)
    })
    .catch((err) => console.log('something went wrong', err))
  },[spotifyApi, playlistId])

  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
      <header className="absolute top-5 right-8">
        <div className="flex cursor-pointer items-center space-x-3 rounded-full bg-black p-1 pr-2 opacity-90 hover:opacity-80 text-white"
          onClick={() => signOut()}
        >
          <img
            className="h-10 w-10 rounded-full"
            src={session?.user?.image}
            alt=""
          ></img>
          <h2>{session?.user.name}</h2>
          <ChevronDownIcon className="h5 w-5" />
        </div>
      </header>
      <section
        className={`p-8 flex h-80 items-end space-x-7 bg-gradient-to-b ${color} to-black text-white`}
      >
          <img className='h-44 w-44 shadow-2xl' src={playlist?.images?.[0]?.url}></img>
        <div>
          <p>Playlist</p>
          <h1 className='text-2xl md:text-3xl xl:text-5xl font-bold'>{playlist?.name}</h1>
        </div>
      </section>
      <div>
        <Songs />
      </div>
    </div>
  )
}

export default Center
