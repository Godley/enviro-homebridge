import { Service, PlatformAccessory, Logger } from 'homebridge';

import { EnviroHomebridgePlatform } from './platform';
import { Reading, Common, Board } from './enviro';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EnviroCommon implements Board {
  name: string;
  mac?: string;
  humid: Service;
  temp: Service;
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
    this.logger = logger;
    this.mac = mac;
    this.newReading = this.newReading.bind(this);
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Pimoroni')
      .setCharacteristic(this.platform.Characteristic.Model, 'unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, uid);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.temp = this.accessory.getService(this.platform.Service.TemperatureSensor)
    || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humid = this.accessory.getService('General humidity')
    || this.accessory.addService(this.platform.Service.HumiditySensor, 'General humidity', 'general-humidity');
  }

  newReading(r: Reading) {
    const reading = r as Common;
    this.logger.debug(`new humidity: ${reading.humidity}`);
    this.logger.debug(`new temp: ${reading.temperature}`);
    this.logger.debug(`new pressure: ${reading.pressure}`);
    this.temp.setCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.temperature);
    this.humid.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity);
  }

}
