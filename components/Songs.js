import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { playlistState } from '../atoms/playlistAtom';
import Song from '../components/Song';

function Songs() {
    const playlist = useRecoilValue(playlistState)

    const [randomNumber, setRandomNumber] = useState(0);

    console.log(playlist, 'playlist')

    useEffect(() => {
        setRandomNumber(Math.floor(Math.random() * playlist?.tracks?.items?.length))
    },[])



    return (
        <div className="px-8 flex flex-col space-y-1 pb-28 text-white">
            {randomNumber &&
               <Song key={playlist.id} track={playlist.tracks.items[randomNumber]}/>
            }
        </div>
    )
}

export default Songs;
