import { useRecoilState, useRecoilValue } from 'recoil';
import useSpotify from '../hooks/useSpotify'
import {millisToMinutesAndSeconds} from '../lib/time'
import {currentTrackIdState, isPlayingState, positionMsState, orderInPlaylistState} from '../atoms/songAtom'


function Song({ order, track }) {
  const spotifyApi = useSpotify();
  const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
  const [orderInPlaylist, setOrderInPlaylist] = useRecoilState(orderInPlaylistState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [positionMs, setPositionMs] = useRecoilState(positionMsState)

  const playSong = () => {
    setOrderInPlaylist(order)
    setCurrentTrackId(track.track.id)
    setPositionMs(0)
    setIsPlaying(true)
    spotifyApi.play({
        uris: [track.track.uri],
    });
  };

  return (

    <div className='grid grid-cols-2 text-gray-500 py-4 px-5 hover:bg-gray-900 rounded-lg cursor-pointer'
    onClick={playSong}
    >
    </div>
  )
}

export default Song
