import { Service, PlatformAccessory, Logger } from 'homebridge';

import { EnviroHomebridgePlatform } from './platform';
import { Reading, Urban, Board } from './enviro';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EnviroUrban implements Board {
  name: string;
  mac?: string;
  humid: Service;
  temp: Service;
  air_quality: Service;

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
      .setCharacteristic(this.platform.Characteristic.Model, 'urban')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, uid);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.temp = this.accessory.getService(this.platform.Service.TemperatureSensor)
    || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humid = this.accessory.getService(this.platform.Service.HumiditySensor)
    || this.accessory.addService(this.platform.Service.HumiditySensor);
    this.air_quality = this.accessory.getService(this.platform.Service.AirQualitySensor)
    || this.accessory.addService(this.platform.Service.AirQualitySensor);

  }

  newReading(r: Reading) {
    const reading = r as Urban;
    this.logger.debug(`new humidity: ${reading.humidity}`);
    this.logger.debug(`new temp: ${reading.temperature}`);
    this.logger.debug(`new pressure: ${reading.pressure}`);
    this.logger.debug(`new pm1: ${reading.pm1}`);
    this.logger.debug(`new pm2.5: ${reading.pm2_5}`);
    this.logger.debug(`new pm10: ${reading.pm10}`);
    this.logger.debug(`new noise: ${reading.noise}`);
    this.temp.setCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.temperature);
    this.humid.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity);
    this.air_quality.setCharacteristic(this.platform.Characteristic.PM2_5Density, reading.pm2_5);
    this.air_quality.setCharacteristic(this.platform.Characteristic.PM10Density, reading.pm10);
  }

}
