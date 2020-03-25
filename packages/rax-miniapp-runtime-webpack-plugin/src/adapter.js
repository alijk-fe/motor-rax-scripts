const { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP } = require('./constants');

module.exports = {
  [MINIAPP]: {
    name: 'Alibaba MiniApp',
    APINamespace: 'my',
    npmDirName: 'node_modules',
    fileName: 'ali',
    css: 'acss',
    xml: 'axml',
    directive: {
      prefix: 'a',
      if: 'a:if',
      elif: 'a:alif',
    },
  },
  [WECHAT_MINIPROGRAM]: {
    name: 'Wechat MiniProgram',
    APINamespace: 'wx',
    npmDirName: 'miniprogram_npm',
    fileName: 'wechat',
    css: 'wxss',
    xml: 'wxml',
    directive: {
      prefix: 'wx',
      if: 'wx:if',
      elif: 'wx:alif',
    },
  },
  [BYTEDANCE_MICROAPP]: {
    name: 'ByteDance MicroApp',
    APINamespace: 'tt',
    npmDirName: 'microapp_npm',
    fileName: 'bytedance',
    css: 'ttss',
    xml: 'ttml',
    directive: {
      prefix: 'tt',
      if: 'tt:if',
      elif: 'tt:elif',
    },
  }
};
