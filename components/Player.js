import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRecoilState } from 'recoil'
import { currentTrackIdState, isPlayingState } from '../atoms/songAtom'
import { debounce } from 'lodash'
import useSpotify from '../hooks/useSpotify'
import useSongInfo from '../hooks/useSongInfo'
import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline'
import {
  RewindIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplyIcon,
  SwitchHorizontalIcon,
  VolumeUpIcon,
} from '@heroicons/react/solid'

function Player() {
  const spotifyApi = useSpotify()
  const { data: session, status } = useSession()
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)
  const [volume, setVolume] = useState(50)
  const [positionMs, setPositionMs] = useState(0)

  console.log(positionMs, 'posms')

  const songInfo = useSongInfo()
  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        console.log('Now Playing: ', data?.body?.item)
        setCurrentTrackId(data.body?.item?.id)

        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing)
        })
      })
    }
  }

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body.is_playing) {
        spotifyApi.pause()
        setIsPlaying(false)
      } else {
        spotifyApi.play()
        setIsPlaying(true)
      }
    })
  }

  const nextSong = () => {
    spotifyApi.skipToNext().then(
      function () {
        console.log('Skip to next')
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log('Something went wrong!', err)
      }
    )
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

  useEffect(() => {
    debouncedAdjustPosition(positionMs)
  })

  const debouncedAdjustPosition = useCallback(
    debounce((positionMs) => {
      spotifyApi.seek(positionMs).catch((err) => {})
    }, 500)
  )

  console.log(songInfo, 'info')

  return (
    <div className="grid h-24 grid-cols-3 bg-gradient-to-b from-black to-gray-900 px-2 text-xs text-white md:px-8 md:text-base">
      {/* Left */}
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
      </div>
      {/* Center  */}

      <div>
        <input
          className="w-full md:w-full"
          type="range"
          value={positionMs}
          onChange={(e) => setPositionMs(Number(e.target.value))}
          min={0}
          max={songInfo?.duration_ms}
        />
        <div className="flex items-center justify-evenly">
          <SwitchHorizontalIcon className="button" />
          <RewindIcon className="button" />
          {isPlaying ? (
            <PauseIcon onClick={handlePlayPause} className="button h-10 w-10" />
          ) : (
            <PlayIcon onClick={handlePlayPause} className="button h-10 w-10" />
          )}
          <FastForwardIcon onClick={nextSong} className="button" />
          <ReplyIcon className="button" />
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
  )
}

export default Player
