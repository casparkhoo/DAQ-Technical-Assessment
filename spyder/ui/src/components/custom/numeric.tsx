import { cn } from "@/lib/utils";

interface TemperatureProps {
  temp: any;
  isWarning: boolean;
}

/**
 * Numeric component that displays the temperature value.
 *
 * @param {number} props.temp - The temperature value to be displayed.
 * @param {boolean} props.isWarning - Indicates if the temperature is in warning state.
 * @returns {JSX.Element} The rendered Numeric component.
 */
function Numeric({ temp, isWarning }: TemperatureProps) {
  let tempClass = "text-4xl font-bold transition-colors";

  if (isWarning) {
    tempClass = cn(tempClass, "text-danger"); // Red (danger)
  } else if (temp < 20 || temp > 80) {
    tempClass = cn(tempClass, "text-danger"); // Red (danger)
  } else if ((temp >= 20 && temp <= 25) || (temp >= 75 && temp <= 80)) {
    tempClass = cn(tempClass, "text-warning"); // Yellow (warning)
  } else {
    tempClass = cn(tempClass, "text-safe"); // Green (safe)
  }

  return (
    <div className="flex flex-col items-center">
      <span className={tempClass}>
        {`${temp}°C`}
      </span>
    </div>
  );
}

export default Numeric;