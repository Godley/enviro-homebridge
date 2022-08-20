import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { EnviroAccessory } from './platformAccessory';

import { MqttDriver, Reading } from './mqtt';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class EnviroHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  accessoryHandlers: EnviroAccessory[] = [];


  driver: MqttDriver;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.onNewReading = this.onNewReading.bind(this);
    this.driver = new MqttDriver({
      username: config.username,
      password: config.password,
      hostname: config.hostname,
      prefix: config.topic_prefix,
      port: config.port,
      onNewReading: this.onNewReading,
      log: log,
    });
    this.log.info('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
    });
  }

  onNewReading(name: string, reading: Reading) {
    const uuid = this.api.hap.uuid.generate(name);

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      // the accessory already exists
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

      // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
      // existingAccessory.context.device = device;
      // this.api.updatePlatformAccessories([existingAccessory]);

      let handler = this.accessoryHandlers.find(accessory => accessory.name === name);
      // create the accessory handler for the restored accessory
      // this is imported from `platformAccessory.ts`
      if(!handler) {
        handler = new EnviroAccessory(this, existingAccessory, this.log, name);
        this.accessoryHandlers.push(handler);
      }
      handler.newReading(reading);

      // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
      // remove platform accessories when no longer present
      // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
      // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
    } else {
      // the accessory does not yet exist, so we need to create it
      this.log.info('Adding new accessory:', name);

      // create a new accessory
      const accessory = new this.api.platformAccessory(name, uuid);

      // create the accessory handler for the newly create accessory
      // this is imported from `platformAccessory.ts`
      const handler = new EnviroAccessory(this, accessory, this.log, name);
      this.accessoryHandlers.push(handler);
      handler.newReading(reading);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    if(accessory.displayName !== 'Bedroom' && accessory.displayName !== 'Kitchen') {
      this.log.info('Loading accessory from cache:', accessory.displayName);

      // add the restored accessory to the accessories cache so we can track if it has already been registered
      this.accessories.push(accessory);
    }
  }
}
