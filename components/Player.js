import { useCallback, useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { currentTrackIdState, isPlayingState, positionMsState, orderInPlaylistState } from '../atoms/songAtom'
import {playlistState, correctState, titleState} from '../atoms/playlistAtom'
import {scoreState} from '../atoms/gameAtom'
import { debounce } from 'lodash'
import useSpotify from '../hooks/useSpotify'
import useSongInfo from '../hooks/useSongInfo'
import {
  VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline'
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  VolumeUpIcon,
} from '@heroicons/react/solid'

function Player() {
  const spotifyApi = useSpotify()
  const songInfo = useSongInfo()
  const { data: session, status } = useSession()
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)
  const [positionMs, setPositionMs] = useRecoilState(positionMsState)
  const [score, setScore] = useRecoilState(scoreState)
  const [orderInPlaylist, setOrderInPlaylist] = useRecoilState(orderInPlaylistState)
  const [correct, setCorrect] = useRecoilState(correctState)
  const playlist = useRecoilValue(playlistState)

  const [volume, setVolume] = useState(50)


  const guessInput = useRef();

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id)
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing)
        })
      })
    }
  }

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body?.is_playing) {
        spotifyApi.pause()
        setIsPlaying(false)
      } else {
        spotifyApi.play()
        setIsPlaying(true)
      }
    })
  }

  const nextSong = () => {
    const randomNumber = Math.floor(Math.random() * playlist?.tracks?.items?.length)
    document.querySelector('.input-name').value = "";
    setCorrect(false)
    setCurrentTrackId(playlist?.tracks?.items[randomNumber].track.id)
    setPositionMs(0)
    setIsPlaying(true)
    spotifyApi.play({
      uris: [playlist?.tracks?.items[randomNumber].track.uri],
  });
    setOrderInPlaylist(randomNumber)
  }

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSong()
      setVolume(50)
    }
  }, [currentTrackId, spotifyApi, session])

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debouncedAdjustVolume(volume)
    }
  }, [volume])

  const debouncedAdjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch((err) => {})
    }, 500),
    []
  )

  function inputChange(e) {
    console.log(songInfo.artists[0].name.toUpperCase(), 'info')
    console.log(e.target.value.toUpperCase())
    if(songInfo?.name.toUpperCase() === e.target.value.toUpperCase() || songInfo?.artists[0].name.toUpperCase() === e.target.value.toUpperCase()){
        setCorrect(true)
        setScore(score + 1)
    } else {
      setCorrect(false)
    }
}

  return (
    <div>
      <section className='flex items-center justify-center'>
      <input ref={guessInput} className="input-name m-5 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2" type="text" name="guess" onChange={inputChange}></input>
      </section>
      <div>
      {correct && <h1 className='text-white'>Correct!</h1>}
      </div>
      <div className="grid h-30 grid-cols-3 bg-gradient-to-b from-black to-gray-900 px-2 text-xs text-white md:px-8 md:text-base">
        {/* Left */}
          {correct ?
          <div className="flex items-center space-x-4">
          <img
            className="hidden h-10 w-10 md:inline"
            src={songInfo?.album.images?.[0]?.url}
            alt=""
          />
          <div>
            <h3>{songInfo?.name}</h3>
            <p>{songInfo?.artists?.[0]?.name}</p>
          </div>
        </div> :
          <div></div>
        }


        {/* Center  */}

        <div className='mt-5 mb-5'>
          <div className="flex items-center justify-evenly">
            {isPlaying ? (
              <PauseIcon onClick={handlePlayPause} className="button h-10 w-10" />
            ) : (
              <PlayIcon onClick={handlePlayPause} className="button h-10 w-10" />
            )}
            <FastForwardIcon onClick={nextSong} className="button" />
          </div>
        </div>
        {/* Right Side */}
        <div className="flex items-center justify-end space-x-3 pr-5 md:space-x-4">
          <VolumeDownIcon
            onClick={() => volume > 0 && setVolume(volume - 10)}
            className="button"
          />
          <input
            className="w-14 md:w-28 "
            type="range"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            min={0}
            max={100}
          />
          <VolumeUpIcon
            onClick={() => volume < 100 && setVolume(volume + 10)}
            className="button"
          />
        </div>
      </div>
    </div>
  )
}

export default Player
