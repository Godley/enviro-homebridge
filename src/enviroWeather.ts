import { Service, PlatformAccessory, Logger } from 'homebridge';

import { EnviroHomebridgePlatform } from './platform';
import { Reading, Weather, Board } from './enviro';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EnviroWeather implements Board {
  name: string;
  mac?: string;
  humid: Service;
  temp: Service;
  light: Service;

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
      .setCharacteristic(this.platform.Characteristic.Model, 'weather')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, uid);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.temp = this.accessory.getService(this.platform.Service.TemperatureSensor)
    || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humid = this.accessory.getService(this.platform.Service.HumiditySensor)
    || this.accessory.addService(this.platform.Service.HumiditySensor);
    this.light = this.accessory.getService(this.platform.Service.LightSensor)
    || this.accessory.addService(this.platform.Service.LightSensor);
  }

  newReading(r: Reading) {
    const reading = r as Weather;
    this.logger.debug(`new humidity: ${reading.humidity}`);
    this.logger.debug(`new temp: ${reading.temperature}`);
    this.logger.debug(`new pressure: ${reading.pressure}`);
    this.logger.debug(`new light: ${reading.light}`);
    this.logger.debug(`new rain: ${reading.rain}`);
    this.logger.debug(`new wind speed: ${reading.wind_speed}`);
    this.logger.debug(`new wind direction: ${reading.wind_direction}`);
    this.temp.setCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.temperature);
    this.humid.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity);
    if(reading.light > 0) {
      this.light.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, reading.light);
    } else {
      this.light.setCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, 0.0001);
    }
  }

}
