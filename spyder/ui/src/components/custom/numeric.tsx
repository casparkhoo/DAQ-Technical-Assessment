import { cn } from "@/lib/utils";
interface TemperatureProps {
  temp: any;
}

/**
 * Numeric component that displays the temperature value.
 *
 * @param {number} props.temp - The temperature value to be displayed.
 * @returns {JSX.Element} The rendered Numeric component.
 */
function Numeric({ temp }: TemperatureProps) {
  // TODO: Change the color of the text based on the temperature
  let tempClass = "text-4xl font-bold transition-colors";

  if (temp < 20 || temp > 80) {
    tempClass = cn(tempClass, "text-danger"); // Red (danger)
  } else if ((temp >= 20 && temp <= 25) || (temp >= 75 && temp <= 80)) {
    tempClass = cn(tempClass, "text-warning"); // Yellow (warning)
  } else {
    tempClass = cn(tempClass, "text-safe"); // Green (safe)
  }
  // HINT:
  //  - Consider using cn() from the utils folder for conditional tailwind styling
  //  - (or) Use the div's style prop to change the colour
  //  - (or) other solution

  // Justify your choice of implementation in brainstorming.md

  return (
    <div className={tempClass}>
      {`${temp}°C`}
    </div>
  );
}

export default Numeric;
