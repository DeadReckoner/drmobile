const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Newer Xcode rejects pod targets below iOS 15.0; raise them to match the app's platform.
const TARGET = '15.1';

const SNIPPET = `
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |c|
        c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${TARGET}' if c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ${TARGET}
      end
    end`;

module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const src = fs.readFileSync(podfile, 'utf8');
      if (!src.includes("'IPHONEOS_DEPLOYMENT_TARGET'")) {
        fs.writeFileSync(
          podfile,
          src.replace(/post_install do \|installer\|/, (m) => m + SNIPPET),
        );
      }
      return cfg;
    },
  ]);
