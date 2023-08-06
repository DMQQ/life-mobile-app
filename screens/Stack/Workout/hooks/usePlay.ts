import { useEffect, useState } from "react";

export default function usePlay(delay = 0) {
  const [isPlaying, setIsPlaying] = useState(false); // determines which timer is displayed (TimeKeeper|ClockTimer)

  useEffect(() => {
    // timer start delay (29.07.2023 delayTimerStart set to 0 in Workout screen)
    const id = setTimeout(() => {
      play();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay]);

  function play() {
    setIsPlaying(true);
  }

  function stop() {
    setIsPlaying(false);
  }

  function toggle() {
    setIsPlaying((p) => !p);
  }

  return { isPlaying, play, stop, toggle };
}
