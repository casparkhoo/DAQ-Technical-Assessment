"use client"
import { Sun } from "lucide-react";
import { useState, useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer } from "lucide-react"
import Numeric from "../components/custom/numeric"
import RedbackLogoDarkMode from "../../public/logo-darkmode.svg"
import RedbackLogoLightMode from "../../public/logo-lightmode.svg"
import DigitalClock from "../components/custom/DigitalClock";
import TemperatureGraph from "../components/custom/TemperatureGraph";

const WS_URL = "ws://localhost:8080"

interface VehicleData {
  battery_temperature: number
  timestamp: number
  warning: boolean; // New property to indicate warning state
}

/**
 * Page component that displays DAQ technical assessment. Contains the LiveValue component as well as page header and labels.
 *
 * @returns {JSX.Element} The rendered page component.
 */
export default function Page(): JSX.Element {
  const { theme, setTheme } = useTheme()
  const [temperature, setTemperature] = useState<any>(0)
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const [temperatureData, setTemperatureData] = useState<{ timestamp: number; temperature: number }[]>([]);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const { lastJsonMessage, readyState }: { lastJsonMessage: VehicleData | null; readyState: ReadyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  useEffect(() => {
    switch (readyState) {
      case ReadyState.OPEN:
        console.log("Connected to streaming service")
        setConnectionStatus("Connected")
        break
      case ReadyState.CLOSED:
        console.log("Disconnected from streaming service")
        setConnectionStatus("Disconnected")
        break
      case ReadyState.CONNECTING:
        setConnectionStatus("Connecting")
        break
      default:
        setConnectionStatus("Disconnected")
        break
    }
  }, [readyState]);

  useEffect(() => {
    console.log("Received: ", lastJsonMessage)
    if (lastJsonMessage === null) {
      return
    }
    const newTemperature = parseFloat(lastJsonMessage.battery_temperature.toFixed(3));
    setTemperature(newTemperature);

    // Update temperature data for the graph
    setTemperatureData((prevData) => [
      ...prevData,
      { timestamp: lastJsonMessage.timestamp, temperature: newTemperature }
    ]);

    // Check if the warning condition is met
    setIsWarning(lastJsonMessage.warning); // Set warning state based on the message
  }, [lastJsonMessage])

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
      <header className="px-5 h-20 flex items-center gap-5 border-b">
        <Image
          src={theme === "dark" ? RedbackLogoDarkMode : RedbackLogoLightMode }
          className="h-12 w-auto"
          alt="Redback Racing Logo"
        />
        <h1 className="text-foreground text-xl font-semibold">DAQ Technical Assessment</h1>
        <Badge variant={connectionStatus === "Connected" ? "success" : "destructive"} className="ml-auto">
          {connectionStatus}
        </Badge>
        <DigitalClock />
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-5 py-1 border rounded-lg bg-gray-200 text-black">
          <Sun className="h-5 w-5" />
        </button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <Card className={`w-full max-w-md mb-8 transition-colors duration-500 ${isWarning ? 'bg-red-300' : ''}`}>
          <CardHeader>
            <CardTitle className="text-2xl font-light flex items-center justify-center gap-2">
              <Thermometer className="h-10 w-10" />
              Live Battery Temperature
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Numeric temp={temperature} isWarning={isWarning} />
          </CardContent>
        </Card>
        <Card className="w-full max-w-md mb-8 transition-colors duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-light flex items-center justify-center">Battery Temperature Over Time</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-start">
            <TemperatureGraph data={temperatureData} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}