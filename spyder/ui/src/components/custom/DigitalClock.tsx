import { useEffect, useState } from "react";
const DigitalClock = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    };

    const timerId = setInterval(updateTime, 1000);
    updateTime();

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-2xl font-semibold">
      {time}
    </div>
  );
};

export default DigitalClock;