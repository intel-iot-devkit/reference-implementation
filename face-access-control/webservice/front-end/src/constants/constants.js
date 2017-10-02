export const SETTINGS = {
  NODE_SERVER: "http://localhost:8000",
  CAMERA_FEED_SERVER: "http://localhost:8090",
  CAMERA_FEED_WIDTH: 640,
};

export const LABELS = {
  START_TEXT: "Click me! ",
  END_TEXT: "The count is now: ",
};

export const HTTP = {
  GET_IMAGE: `${SETTINGS.NODE_SERVER}/api/facial-recognition/file/`,
  GET_PROFILE: `${SETTINGS.NODE_SERVER}/api/facial-recognition/profiles/profile/`,
  DATA_SINGLE_CONTACT: `${SETTINGS.NODE_SERVER}/api/facial-recognition/profiles/profile/`, // GET
  DATA_ALL_CONTACTS: `${SETTINGS.NODE_SERVER}/api/facial-recognition/profiles/`, // GET
  DATA_INSERT_PROFILE: `${SETTINGS.NODE_SERVER}/api/facial-recognition/profiles/profile/`, // POST
  CAMERA_FEED: `${SETTINGS.CAMERA_FEED_SERVER}/facstream.mjpeg`, // POST
};
export const MQTT = {
  MQTT_SERVER: "ws://localhost:3000",
  TOPICS: {
    IMAGE: "image",
    SEEN: "person/seen",
    REGISTERED: "person/registered",
    REGISTER: "commands/register", // publish
  },
};

export const CLEARANCE = {
  A: "A Type",
  B: "B Type",
  C: "C Type",
  D: "D Type",
  UNKNOWN: "Unknown",
};

// NOTE: these are also included in the colors in constants.css! 
// If you change them here you should probably change them there as well.
export const CLEARANCE_COLORS = {
  A: "#ff8008",
  B: "#19547b",
  C: "#f05053",
  D: "#4ac29a",
  UNKNOWN: "#424242",
  A_HOVER: "#ec780b",
  B_HOVER: "#184f73",
  C_HOVER: "#e64e50",
  D_HOVER: "#47b892",
  UNKNOWN_HOVER: "#373636",
};

