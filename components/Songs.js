import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { playlistState } from '../atoms/playlistAtom';

function Songs() {
    const playlist = useRecoilValue(playlistState)
    const [randomNumber, setRandomNumber] = useState(0);

    useEffect(() => {
        setRandomNumber(Math.floor(Math.random() * playlist?.tracks?.items?.length))
    },[])

    return (
        <div className="px-8 flex flex-col space-y-1 pb-28 text-white">
        </div>
    )
}

export default Songs;
