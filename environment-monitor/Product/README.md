# AIR QUALITY MONITOR


### Requirements:
Node 4.4.4+ (https://nodejs.org/en/)  
Npm 3.10.6+ 


To check that you meet these requirements:
```
node -v
```
```
npm -v
```

### Setup:
All configurable settings for the project can be found in: air-quality-monitor/Product/client/src/consts.js  


### Build for development/demo
Terminal to air-quality-monitor/Product/client and run
```
npm install
```

When everything has installed, start the local dev server by running
```
npm run dev
```

A web page will open automatically, and the application will start watching for changes. You will not need to re-run this command after updating files in the src/ directory.

To run the application on another device on the network, check the terminal window after running this command.
It will have printed out the external IP address and port needed.

Stop the dev server with ctrl+c


### Online / Offline mode
The application sets the online/offline state automatically based on your actual internet availability. If you want to test offline mode, turn off your internet.

Note: if running the application without internet access, you will need to manually refresh the page after making changes to source code.


### Build for distribution
Terminal to air-quality-monitor/Product/client and run
```
npm run dist
```

Upload the generated 'dist/' folder to a server