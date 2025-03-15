# Brainstorming

This file is used to document your thoughts, approaches and research conducted across all tasks in the Technical Assessment.

## Spyder

### Part 2

The invalid data was due to the data_emulator having a chance of converting the data to a binary string, and 20% of the time this will happen, with BINARY_PROBABILITY being 0.2.

To fix this, I simply made an invalid data recieved warning when we recieve invalid data, and ensured that it was not being visually represented in the UI. Essentially the invalid data is logged in the console and disregarded otherwise.

### Part 4

The connect/disconnected button was not working since the relevant useEffect was not updating everytime the readystate was updated since it was missing the dependency [readyState]. I have added this into the code and it fixed the issue.

### Part 5

I rounded the battery temperature using toFixed(3). To change the colours of the numeric depending on the temperature I used cn() to add either "text-safe", "text-warning" or "text-danger" to the class. This was reflected in the globals.css and tailwind.config.js files where I created the appropriate aliases.

### Three optional features:

- I implemented light mode by taking advantage of the useTheme(), using a button div and an onclick(). It also ensures things like the Redback Logo switch with mode.

- I added a temperature graph using recharts, which is a charting library from react. It allowed me to easily make a graph of the past temperature data. I included this as a dependency so that it works always. This is done in the TemperatureGraph.tsx custom component

- I added a warning system, where the numeric card goes red when the battery temperature goes out of range more than 3 times in 5 seconds. I did this by simply creating a warning boolean and changing the colour of the card based on there being a warning.

- I added a digital clock as well, making a new custom component in a similar way to TemperatureGraph.

- I made the transition between light and dark mode smoother

- I improved the scale of some of the components which I thought were a bit too small or a bit to large
