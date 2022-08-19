import { Service, PlatformAccessory, Logger, Perms } from 'homebridge';

import { EnviroHomebridgePlatform } from './platform';
import { Reading } from './mqtt';
import {v4 as uuidv4} from 'uuid';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EnviroAccessory {
  name: string;
  humid: Service;
  temp: Service;
  moisture_1: Service;
  moisture_2: Service;
  moisture_3: Service;
  pressure: Service;
  //soil_moisture_1: Service;
  //soil_moisture_2: Service;
  //soil_moisture_3: Service;
  logger: Logger;

  pressureCharacteristic: string;

  constructor(
    private readonly platform: EnviroHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    logger: Logger,
    name: string,
  ) {
    this.name = name;
    this.logger = logger;
    logger.debug('hello, world');
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Pimoroni')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.temp = this.accessory.getService(this.platform.Service.TemperatureSensor)
    || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humid = this.accessory.getService('General humidity')
    || this.accessory.addService(this.platform.Service.HumiditySensor, 'General humidity', 'general-humidity');
    this.moisture_1 = this.accessory.getService('Soil moisture 1')
    || this.accessory.addService(this.platform.Service.HumiditySensor, 'Soil moisture 1', 'soil-moisture-1');
    this.moisture_2 = this.accessory.getService('Soil moisture 2')
    || this.accessory.addService(this.platform.Service.HumiditySensor, 'Soil moisture 2', 'soil-moisture-2');
    this.moisture_3 = this.accessory.getService('Soil moisture 3')
    || this.accessory.addService(this.platform.Service.HumiditySensor, 'Soil moisture 3', 'soil-moisture-3');
    this.pressure = new this.platform.Service('pressure', uuidv4());
    this.pressureCharacteristic = uuidv4();
    const pressure = new this.platform.Characteristic('air pressure', this.pressureCharacteristic, {
      unit: 'hPa',
      minValue: 0.0,
      maxValue: 1100,
      format: 'float',
      perms: [Perms.NOTIFY]});
    this.pressure.addCharacteristic(pressure);
  }

  newReading(reading: Reading) {
    this.logger.debug(`new humidity: ${reading.humidity}`);
    this.logger.debug(`new temp: ${reading.temperature}`);
    this.logger.debug(`new pressure: ${reading.pressure}`);
    this.logger.debug(`new soil moistures: ${reading.moisture_1}, ${reading.moisture_2}, ${reading.moisture_3}`);
    this.temp.setCharacteristic(this.platform.Characteristic.CurrentTemperature, reading.temperature);
    this.humid.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.humidity);
    this.pressure.setCharacteristic('air pressure', reading.pressure);
    this.moisture_1.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.moisture_1);
    this.moisture_2.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.moisture_2);
    this.moisture_3.setCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, reading.moisture_3);
  }

}
