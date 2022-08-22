
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge plugin for pimoroni enviro

This plugin is built to connect [pimoroni enviro](https://github.com/pimoroni/enviro) boards to homekit. Once installed and configured, the plugin will automatically detect any boards publishing to `<topic_prefix>/` and create and update sensors in homebridge. 

## Currently supported boards/sensors

This plugin is written for the enviro grow, which has a humidity, temperature, air pressure and three soil moisture sensors on it. We intend to make it more flexible in the future, but as it stands if you use any other enviro board you'll get the sensors on the grow in homekit and none others.

**Note:** 
- **soil moisture sensors will show up as humidity sensors.** This is due to apple not yet supporting them as their own entities - since they both show up as a droplet, and both are measured as a percentage, this made the most sense. 
- **Air pressure will not show due to Apple not supporting air pressure sensors.** There is still work to be done to add it to the homekit api in order to surface it using other apps (e.g your own app) but it may be best to just wait until Apple support it natively.

## Config

| name  | default  | description  |
|---|---|---|
| username  | --  | The mqtt username for your broker  |
| password  | --  | The mqtt password for your broker  |
| host  |  -- | The host for your broker. Will either be a url (e.g test.mosquitto.org) or an IP (e.g 192.168.-.-). No protocol or port should be included |
| port  | 1883 | The port your mqtt broker is running on, if different from the default. *You probably don't need to change this*  |
| topic_prefix  | enviro | The prefix (before the slash) your boards use for their mqtt topics. *You probably don't need to change this*  |



## Running this plugin
You will need to run an mqtt broker and homebridge in order for this to work. For the mqtt broker we recommend [mosquitto](https://mosquitto.org), homebridge install instructions can be found [here](https://homebridge.io).

You will also need to configure each of your boards to upload to mqtt, using the same broker as above.

Once you have homebridge installed and running, in the homebridge UI go to Plugins and search for "Pimoroni Enviro". Install it and configure it following the table above, and you're done!

# Contributing

Happy to accept PRs - please raise an issue first to discuss unless it's typo or style fixes. 
## Setup Development Environment

To develop Homebridge plugins you must have Node.js 12 or later installed, and a modern code editor such as [VS Code](https://code.visualstudio.com/). This plugin uses [TypeScript](https://www.typescriptlang.org/) to make development easier and comes with pre-configured settings for [VS Code](https://code.visualstudio.com/) and ESLint. If you are using VS Code install these extensions:

* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

On submitting a PR the CI is configured to only accept fully linted code - to check if you will have any issues run `yarn lint` (or `npm lint`) and fix everything including warnings.

## Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```
npm install
```

## Build Plugin

TypeScript needs to be compiled into JavaScript before it can run. The following command will compile the contents of your [`src`](./src) directory and put the resulting code into the `dist` folder.

```
npm run build
```

## Link To Homebridge

Run this command so your global install of Homebridge can discover the plugin in your development environment:

```
npm link
```

You can now start Homebridge, use the `-D` flag so you can see debug log messages in your plugin:

```
homebridge -D
```

You will also need to add the plugin to the homebridge config at `~/.homebridge/config.json`, e.g:
```
...
    "platforms": [
        {
            "name": "Config",
            "port": 8581,
            "platform": "config"
        },
        {
            "name": "pimoroni-enviro-plugin",
            "url": "<hostname>",
            "port": "1883",
            "username": "<username>",
            "password": "<password>",
            "qos": 0,
            "topic_prefix": "enviro",
            "platform": "PimoroniEnviroPlugin"
        }
    ]
```
## Watch For Changes and Build Automatically

If you want to have your code compile automatically as you make changes, and restart Homebridge automatically between changes you can run:

```
npm run watch
```

This will launch an instance of Homebridge in debug mode which will restart every time you make a change to the source code. It will load the config stored in the default location under `~/.homebridge`. You may need to stop other running instances of Homebridge while using this command to prevent conflicts. You can adjust the Homebridge startup command in the [`nodemon.json`](./nodemon.json) file.

## Plugin layout

* [`src/mqtt.ts`](./src/mqtt.ts) - this is a slim client for subscribing to enviro-specific mqtt topics. It handles connecting and subscribing to all of the topics under `<topic_prefix>/` and then parses the readings into a javascript type `Reading`, then passes the reading back to `onNewReadingCB`.

* [`src/platform.ts`](./src/platform.ts) - this is where devices are discovered and we start a connection to the mqtt broker.

* [`src/platformAccessory.ts`](./src/platformAccessory.ts) - this is where we create the appropriate sensors and update characteristics in homekit. Sensors are created in the constructor, characteristics are updated in in `newReading`

* [`config.schema.json`](./config.schema.json) - update the config schema to match the config you expect from the user. See the [Plugin Config Schema Documentation](https://developers.homebridge.io/#/config-schema).