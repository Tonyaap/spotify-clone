import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { currentTrackIdState, isPlayingState, positionMsState, orderInPlaylistState } from '../atoms/songAtom'
import {playlistState} from '../atoms/playlistAtom'
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
  const [positionMs, setPositionMs] = useRecoilState(positionMsState)
  const [orderInPlaylist, setOrderInPlaylist] = useRecoilState(orderInPlaylistState)
  const playlist = useRecoilValue(playlistState)

  const songInfo = useSongInfo()

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
    setCurrentTrackId(playlist?.tracks?.items[orderInPlaylist + 1].track.id)
    fetchCurrentSong();
    setPositionMs(0)
    setIsPlaying(true)
    spotifyApi.play({
      uris: [playlist?.tracks?.items[orderInPlaylist + 1].track.uri],
  });
    setOrderInPlaylist(orderInPlaylist + 1)
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

  spotifyApi.getMyCurrentPlayingTrack()
  .then(function(data) {
    console.log('Now playing: ' + data.body.item.name);
  }, function(err) {
    console.log('Something went wrong!', err);
  });

  return (
    <div className="grid h-30 grid-cols-3 bg-gradient-to-b from-black to-gray-900 px-2 text-xs text-white md:px-8 md:text-base">
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

      <div className='mt-5 mb-5'>
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
