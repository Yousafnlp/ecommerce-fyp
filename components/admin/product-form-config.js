// Shared configuration for the admin product form: category → brand and
// specification field mappings, plus conversion between the flat form values
// and the nested `specifications` object stored on each product document.

export const CATEGORY_OPTIONS = [
  "smartphone",
  "tablet",
  "laptop",
  "monitor",
  "charger",
  "console",
  "earbuds",
  "headphone",
  "processor",
  "smartwatch",
];

export const BRAND_OPTIONS = {
  smartphone: ["Apple", "Samsung", "Google"],
  tablet: ["Apple", "Samsung"],
  laptop: ["Apple", "Dell", "ASUS"],
  monitor: ["Dell", "LG", "Samsung"],
  charger: ["Apple", "Samsung", "Anker"],
  console: ["Sony"],
  earbuds: ["Sony", "Apple", "Samsung"],
  headphone: ["Sony", "Apple"],
  processor: ["AMD", "Intel"],
  smartwatch: ["Apple", "Samsung", "Garmin"],
};

export const CATEGORY_SPEC_FIELDS = {
  smartphone: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["ram", "RAM"],
    ["storage", "Storage"],
    ["processor", "Processor"],
    ["displaySize", "Display Size"],
    ["refreshRate", "Refresh Rate"],
    ["cameraMain", "Main Camera"],
  ],
  tablet: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["ram", "RAM"],
    ["storage", "Storage"],
    ["processor", "Processor"],
    ["displaySize", "Display Size"],
    ["refreshRate", "Refresh Rate"],
  ],
  laptop: [
    ["model", "Model"],
    ["cpu", "CPU"],
    ["ram", "RAM"],
    ["storage", "Storage"],
    ["screenSize", "Screen Size"],
    ["refreshRate", "Refresh Rate"],
    ["battery", "Battery"],
  ],
  monitor: [
    ["model", "Model"],
    ["displaySize", "Display Size"],
    ["resolution", "Resolution"],
    ["refreshRate", "Refresh Rate"],
    ["responseTime", "Response Time"],
    ["panelType", "Panel Type"],
  ],
  charger: [
    ["model", "Model"],
    ["output", "Output"],
    ["ports", "Ports (comma separated)"],
    ["connector", "Connector"],
  ],
  console: [
    ["model", "Model"],
    ["storage", "Storage"],
    ["resolution", "Resolution"],
    ["fps", "FPS"],
  ],
  earbuds: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["driverSize", "Driver Size"],
    ["wireless", "Wireless (true/false)"],
    ["noiseCancellation", "Noise Cancellation (true/false)"],
  ],
  headphone: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["driverSize", "Driver Size"],
    ["wireless", "Wireless (true/false)"],
    ["noiseCancellation", "Noise Cancellation (true/false)"],
  ],
  processor: [
    ["model", "Model"],
    ["cores", "Cores"],
    ["baseClock", "Base Clock"],
    ["boostClock", "Boost Clock"],
    ["socket", "Socket"],
  ],
  smartwatch: [
    ["model", "Model"],
    ["battery", "Battery"],
    ["displaySize", "Display Size"],
    ["gps", "GPS (true/false)"],
    ["healthTracking", "Health Tracking (true/false)"],
  ],
};

export const baseSpecValues = {
  model: "",
  battery: "",
  ram: "",
  storage: "",
  processor: "",
  displaySize: "",
  refreshRate: "",
  cameraMain: "",
  cpu: "",
  screenSize: "",
  resolution: "",
  responseTime: "",
  panelType: "",
  output: "",
  ports: "",
  connector: "",
  fps: "",
  driverSize: "",
  wireless: "",
  noiseCancellation: "",
  cores: "",
  baseClock: "",
  boostClock: "",
  socket: "",
  gps: "",
  healthTracking: "",
};

/** Flattens a stored `specifications` object into form field values. */
export function parseSpecifications(specs = {}) {
  const values = { ...baseSpecValues };
  const display = specs.display || {};
  const asText = (value) => (value === undefined || value === null ? "" : String(value));
  const asBoolText = (value) => (value === true ? "true" : "");

  values.model = asText(specs.model);
  values.battery = asText(specs.battery);
  values.ram = asText(specs.ram);
  values.storage = asText(specs.storage);
  values.processor = asText(specs.processor);
  values.cpu = asText(specs.cpu);
  values.screenSize = asText(specs.screenSize);
  values.output = asText(specs.output);
  values.connector = asText(specs.connector);
  values.driverSize = asText(specs.driverSize);
  values.cores = asText(specs.cores);
  values.baseClock = asText(specs.baseClock);
  values.boostClock = asText(specs.boostClock);
  values.socket = asText(specs.socket);
  values.fps = asText(specs.fps);

  if (Array.isArray(specs.ports)) values.ports = specs.ports.join(", ");
  values.wireless = asBoolText(specs.wireless);
  values.noiseCancellation = asBoolText(specs.noiseCancellation);
  values.gps = asBoolText(specs.gps);
  values.healthTracking = asBoolText(specs.healthTracking);

  values.displaySize = asText(display.size);
  values.refreshRate = asText(display.refreshRate);
  values.resolution = asText(display.resolution);
  values.responseTime = asText(display.responseTime);
  values.panelType = asText(display.type);
  values.cameraMain = asText(specs.camera?.main);

  return values;
}

/** Builds the nested `specifications` object from flat form values. */
export function buildSpecifications(category, brand, values) {
  const specs = {
    brand,
  };

  if (values.model) specs.model = values.model;
  if (values.battery) specs.battery = values.battery;
  if (values.ram) specs.ram = values.ram;
  if (values.storage) specs.storage = values.storage;
  if (values.processor) specs.processor = values.processor;
  if (values.cpu) specs.cpu = values.cpu;
  if (values.screenSize) specs.screenSize = values.screenSize;
  if (values.output) specs.output = values.output;
  if (values.connector) specs.connector = values.connector;
  if (values.ports) specs.ports = values.ports.split(",").map((item) => item.trim()).filter(Boolean);
  if (values.driverSize) specs.driverSize = values.driverSize;
  if (values.wireless) specs.wireless = values.wireless.toLowerCase() === "true";
  if (values.noiseCancellation) specs.noiseCancellation = values.noiseCancellation.toLowerCase() === "true";
  if (values.cores) specs.cores = values.cores;
  if (values.baseClock) specs.baseClock = values.baseClock;
  if (values.boostClock) specs.boostClock = values.boostClock;
  if (values.socket) specs.socket = values.socket;
  if (values.fps) specs.fps = values.fps;
  if (values.gps) specs.gps = values.gps.toLowerCase() === "true";
  if (values.healthTracking) specs.healthTracking = values.healthTracking.toLowerCase() === "true";

  const display = {};
  if (values.displaySize) display.size = values.displaySize;
  if (values.refreshRate) display.refreshRate = values.refreshRate;
  if (values.resolution) display.resolution = values.resolution;
  if (values.responseTime) display.responseTime = values.responseTime;
  if (values.panelType) display.type = values.panelType;
  if (Object.keys(display).length > 0) specs.display = display;

  if (values.cameraMain) {
    specs.camera = {
      main: values.cameraMain,
    };
  }

  if (category === "monitor" && values.panelType) {
    specs.display = {
      ...(specs.display || {}),
      type: values.panelType,
    };
  }

  return specs;
}
