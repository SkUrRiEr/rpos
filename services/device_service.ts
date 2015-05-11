///<reference path="../typings/tsd.d.ts" />
///<reference path="../typings/rpos/rpos.d.ts" />

import fs = require("fs");
import util = require("util");
import os = require('os');
import SoapService = require('../lib/SoapService');
import { Utils }  from '../lib/utils';
import { Server } from 'http';
var utils = Utils.utils;

class DeviceService extends SoapService {
  device_service: any;
  constructor(config: rposConfig, server: Server) {
    super(config, server);

    this.device_service = require('./stubs/device_service.js').DeviceService;

    this.serviceOptions = {
      path: '/onvif/device_service',
      services: this.device_service,
      xml: fs.readFileSync('./wsdl/device_service.wsdl', 'utf8'),
      wsdlPath: 'wsdl/device_service.wsdl',
      onReady: () => console.log('device_service started')
    };

    this.extendService();
  }

  extendService() {
    var port = this.device_service.DeviceService.Device;

    port.GetDeviceInformation = (args /*, cb, headers*/) => {
      var GetDeviceInformationResponse = {
        Manufacturer: this.config.DeviceInformation.Manufacturer,
        Model: this.config.DeviceInformation.Manufacturer,
        FirmwareVersion: this.config.DeviceInformation.FirmwareVersion,
        SerialNumber: this.config.DeviceInformation.SerialNumber,
        HardwareId: this.config.DeviceInformation.HardwareId
      };
      return GetDeviceInformationResponse;
    };

    port.GetSystemDateAndTime = (args /*, cb, headers*/) => {
      var now = new Date();
      var GetSystemDateAndTimeResponse = {
        SystemDateAndTime: {
          DateTimeType: "NTP",
          DaylightSavings: now.dst(),
          TimeZone: {
            TZ: "CET-1CEST,M3.5.0,M10.5.0/3"
          },
          UTCDateTime: {
            Date: { Day: now.getUTCDate(), Month: now.getUTCMonth() + 1, Year: now.getUTCFullYear() },
            Time: { Hour: now.getUTCHours(), Minute: now.getUTCMinutes(), Second: now.getUTCSeconds() }
          },
          LocalDateTime: {
            Date: { Day: now.getDate(), Month: now.getMonth() + 1, Year: now.getFullYear() },
            Time: { Hour: now.getHours(), Minute: now.getMinutes(), Second: now.getSeconds() }
          },
          Extension: {}
        }
      };
      return GetSystemDateAndTimeResponse;
    };

    port.SystemReboot = (args /*, cb, headers*/) => {
      var SystemRebootResponse = {
        Message: utils.execSync("sudo reboot")
      };
      return SystemRebootResponse;
    };

    port.GetCapabilities = (args /*, cb, headers*/) => {
      var category = args.Category;
      //{ 'All', 'Analytics', 'Device', 'Events', 'Imaging', 'Media', 'PTZ' }
      var GetCapabilitiesResponse = {
        Capabilities: {}
      };

      if (category == "All" || category == "Device") {
        GetCapabilitiesResponse.Capabilities["Device"] = {
          XAddr: `http://${utils.getIpAddress() }:${this.config.ServicePort}/onvif/device_service`,
          Network: {
            IPFilter: false,
            ZeroConfiguration: false,
            IPVersion6: false,
            DynDNS: false,
            Extension: {
              Dot11Configuration: false,
              Extension: {}
            }
          },
          System: {
            DiscoveryResolve: false,
            DiscoveryBye: false,
            RemoteDiscovery: false,
            SystemBackup: false,
            SystemLogging: false,
            FirmwareUpgrade: false,
            SupportedVersions: {
              Major: 2,
              Minor: 5
            },
            Extension: {
              HttpFirmwareUpgrade: false,
              HttpSystemBackup: false,
              HttpSystemLogging: false,
              HttpSupportInformation: false,
              Extension: {}
            }
          },
          IO: {
            InputConnectors: 0,
            RelayOutputs: 0,
            Extension: {
              Auxiliary: false,
              AuxiliaryCommands: "",
              Extension: {}
            }
          },
          Security: {
            "TLS1.1": false,
            "TLS1.2": false,
            OnboardKeyGeneration: false,
            AccessPolicyConfig: false,
            "X.509Token": false,
            SAMLToken: false,
            KerberosToken: false,
            RELToken: false,
            Extension: {
              "TLS1.0": false,
              Extension: {}
            }
          },
          Extension: {}
        };
      }
      if (category == "All" || category == "Media") {
        GetCapabilitiesResponse.Capabilities["Media"] = {
          XAddr: `http://${utils.getIpAddress() }:${this.config.ServicePort}/onvif/media_service`,
          StreamingCapabilities: {
            RTPMulticast: false,
            RTP_TCP: true,
            RTP_RTSP_TCP: true,
            Extension: {}
          },
          Extension: {
            ProfileCapabilities: {
              MaximumNumberOfProfiles: 1
            }
          }
        }
      }
      return GetCapabilitiesResponse;
    };

    port.GetHostname = (args /*, cb, headers*/) => {
      var GetHostnameResponse = {
        HostnameInformation: {
          FromDHCP: false,
          Name: os.hostname(),
          Extension: {}
        }
      };
      return GetHostnameResponse;
    };

    port.SetHostname = (args /*, cb, headers*/) => {
      var SetHostnameResponse = {};
      return SetHostnameResponse;
    };

    port.SetHostnameFromDHCP = (args /*, cb, headers*/) => {
      var SetHostnameFromDHCPResponse = {
        RebootNeeded: false
      };
      return SetHostnameFromDHCPResponse;
    };

    port.GetServiceCapabilities = (args /*, cb, headers*/) => {
      var GetServiceCapabilitiesResponse = {
        Capabilities: {
          Network: {
            attributes: {
              IPFilter: false,
              ZeroConfiguration: false,
              IPVersion6: false,
              DynDNS: false,
              Dot11Configuration: false,
              Dot1XConfigurations: 0,
              HostnameFromDHCP: false,
              NTP: 0,
              DHCPv6: false
            }
          },
          Security: {
            attributes: {
              "TLS1.0": false,
              "TLS1.1": false,
              "TLS1.2": false,
              OnboardKeyGeneration: false,
              AccessPolicyConfig: false,
              DefaultAccessPolicy: false,
              Dot1X: false,
              RemoteUserHandling: false,
              "X.509Token": false,
              SAMLToken: false,
              KerberosToken: false,
              UsernameToken: false,
              HttpDigest: false,
              RELToken: false,
              SupportedEAPMethods: 0,
              MaxUsers: 1,
              MaxUserNameLength: 10,
              MaxPasswordLength: 256
            }
          },
          System: {
            attributes: {
              DiscoveryResolve: false,
              DiscoveryBye: false,
              RemoteDiscovery: false,
              SystemBackup: false,
              SystemLogging: false,
              FirmwareUpgrade: false,
              HttpFirmwareUpgrade: false,
              HttpSystemBackup: false,
              HttpSystemLogging: false,
              HttpSupportInformation: false,
              StorageConfiguration: false
            }
          },
          //Misc : { 
          //  attributes : {
          //    AuxiliaryCommands : {tt:StringAttrList}
          //  }
          //}
        }
      };
      return GetServiceCapabilitiesResponse;
    };

    port.GetNTP = (args /*, cb, headers*/) => {
      var GetNTPResponse = {};
      return GetNTPResponse;
    };

    port.SetNTP = (args /*, cb, headers*/) => {
      var SetNTPResponse = {};
      return SetNTPResponse;
    };

    port.GetNetworkInterfaces = (args /*, cb, headers*/) => {
      var GetNetworkInterfacesResponse = {
        NetworkInterfaces: []
      };
      var nwifs = os.networkInterfaces();
      for (var nwif in nwifs) {
        GetNetworkInterfacesResponse.NetworkInterfaces.push({
          attributes: {
            token: nwif
          }
        });
      }
      return GetNetworkInterfacesResponse;
    };

    port.GetNetworkProtocols = (args /*, cb, headers*/) => {
      var GetNetworkProtocolsResponse = {
        NetworkProtocols: [{
          Name: "RTSP",
          Enabled: true,
          Port: this.config.RTSPPort
        }]
      };
      return GetNetworkProtocolsResponse;
    };

    port.GetRelayOutputs = (args /*, cb, headers*/) => {
      var GetRelayOutputsResponse = {};
      return GetRelayOutputsResponse;
    };
  }
}
export = DeviceService;