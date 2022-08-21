import { Logger } from 'homebridge';
import mqtt from 'mqtt';

export interface Reading {
    pressure: number;
    temperature: number;
    humidity: number;
    moisture_1: number;
    moisture_2: number;
    moisture_3: number;
    device: string;
    timestamp: string;
    pump_1_on?: boolean;
    pump_2_on?: boolean;
    pump_3_on?: boolean;
}

interface DriverOptions {
    username: string;
    password: string;
    hostname: string;
    port: number;
    prefix: string;
    log: Logger;
    onNewDevice: (name: string, reading: Reading) => void;
}

export class MqttDriver {
  client: mqtt.MqttClient;
  prefix: string;
  onNewDevice: (name: string, reading: Reading) => void;
  onNewReading: Map<string, (reading: Reading) => void>;

  constructor({ username, password, hostname, port, prefix, log, onNewDevice }: DriverOptions) {
    const mqttOpts: mqtt.IClientOptions = {
      username: username,
      password: password,
      hostname: hostname,
      port: port,
      clientId: 'homebridge-enviro-plugin',
    };
    this.onNewReading = new Map([]);
    this.prefix = prefix;
    this.onNewDevice = onNewDevice;
    this.addCallback = this.addCallback.bind(this);
    this.client = mqtt.connect(mqttOpts);
    this.client.on('connect', () => {
      this.client.subscribe(prefix + '/#', (err) => {
        if(err) {
          log.error(`failed connecting to topic ${prefix}/#: ${err}`);
        }
      });
    });
    this.client.on('message', (topic, message) => {
      const parts = topic.split('/');
      if(parts[0] !== this.prefix) {
        // should never happen since we never subscribe to other topics
        log.error(`unexpected prefix: ${parts[0]}`);
        return null;
      }

      const reading: Reading = JSON.parse(message.toString());
      log.info(`got new reading on device ${parts[1]}`);
      const cb = this.onNewReading.get(parts[1]);
      if(!cb) {
        this.onNewDevice(parts[1], reading);
      } else {
        cb(reading);
      }
    });
  }

  addCallback(topic_suffix: string, cb: (reading: Reading) => void) {
    this.onNewReading.set(topic_suffix, cb);
  }
}
