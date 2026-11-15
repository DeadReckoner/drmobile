// Dynamic layer over app.json.
//
// Android push notifications need Firebase's google-services.json at build
// time. This repository is public, so the file is not committed:
//
//   - On EAS Build it comes from the GOOGLE_SERVICES_JSON file variable; EAS
//     writes the file on the build machine and sets the variable to its path.
//   - Locally it is read from ./google-services.json if you have put a copy
//     there (the file is gitignored).
//
// With neither present the app still builds; Android push is simply not
// configured, which is how the app behaved before this file existed.

/* global __dirname */

const fs = require('fs');
const path = require('path');

const LOCAL_GOOGLE_SERVICES_FILE = './google-services.json';

const resolveGoogleServicesFile = () => {
  if (process.env.GOOGLE_SERVICES_JSON) {
    return process.env.GOOGLE_SERVICES_JSON;
  }
  if (fs.existsSync(path.join(__dirname, LOCAL_GOOGLE_SERVICES_FILE))) {
    return LOCAL_GOOGLE_SERVICES_FILE;
  }
  return undefined;
};

module.exports = ({ config }) => {
  const googleServicesFile = resolveGoogleServicesFile();
  if (!googleServicesFile) {
    return config;
  }

  return {
    ...config,
    android: {
      ...config.android,
      googleServicesFile,
    },
  };
};
