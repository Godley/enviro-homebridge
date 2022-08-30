import { Service, PlatformAccessory, Logger } from 'homebridge';

import { EnviroHomebridgePlatform } from './platform';
import { Reading, Indoor, Board } from './enviro';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EnviroIndoor implements Board {
  name: string;
  mac?: string;
  humid: Service;
  temp: Service;
  color_temp: Service;

  //soil_moisture_1: Service;
  //soil_moisture_2: Service;
  //soil_moisture_3: Service;
  logger: Logger;

  constructor(
    private readonly platform: EnviroHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    logger: Logger,
    name: string,
    uid: string,
    mac?: string,
  ) {
    this.name = name;
    this.mac = mac;
    this.logger = logger;
    this.newReading = this.newReading.bind(this);
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Pimoroni')
      .setCharacteristic(this.platform.Characteristic.Model, 'indoor')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, uid);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.temp = this.accessory.getService(this.platform.Service.TemperatureSensor)
    || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humid = this.accessory.getService(this.platform.Service.HumiditySensor)
    || this.accessory.addService(this.platform.Service.HumiditySensor);
    // light bulb is the only accessory with the characteristic "color temp"
    this.color_temp = this.accessory.getService(this.platform.Service.Lightbulb)
    || this.accessory.addService(this.platform.Service.Lightbulb);

  }

  newReading(r: Reading) {
    const reading = r as Indoor;
    this.logger.debug(`new humidity: ${reading.humidity}`);
    this.logger.debug(`new temp: ${reading.temperature}`);
    this.logger.debug(`new pressure: ${reading.pressure}`);
    this.logger.debug(`new color temp: ${reading.color_temperature}`);
    this.logger.debug(`new luminance: ${reading.luminance}`);
    this.temp.setCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.temperature);
    this.humid.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity);
    this.color_temp.setCharacteristic(this.platform.Characteristic.ColorTemperature, reading.color_temperature);
  }

}
