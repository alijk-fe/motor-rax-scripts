const path = require('path');
const fs = require('fs-extra');
const { STATIC_CONFIG, CUSTOM_TAB_BAR } = require('../constants');

module.exports = (api) => {
  const { setValue, context } = api;
  const { rootDir } = context;
  let staticConfig;
  try {
    staticConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/app.json')));
  } catch (err) {
    throw new Error('There need app.json in root dir.');
  }

  if (staticConfig.tabBar && staticConfig.tabBar.custom) {
    const customTabBarPath = path.join(rootDir, 'src/CustomTabBar/index');
    if (!checkComponentFileExists(customTabBarPath)) {
      throw new Error(`There need custom tab bar implement in ${customTabBarPath}`);
    }
    if (!Array.isArray(staticConfig.tabBar.list)) {
      throw new Error('There should have list field as array type to know which page need show tab bar');
    }
    setValue(CUSTOM_TAB_BAR, true);
    staticConfig.tabBar.source = 'CustomTabBar/index';
  } else {
    setValue(CUSTOM_TAB_BAR, false);
  }
  setValue(STATIC_CONFIG, staticConfig);
};

function checkComponentFileExists(filepath) {
  return ['jsx', 'js', 'tsx'].some((ext) => fs.existsSync(`${filepath}.${ext}`));
}
