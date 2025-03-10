// 缓存配置
const CACHE_CONFIG = {
  DISHES_CACHE_KEY: 'dishes_cache',
  CACHE_EXPIRE: 5 * 60 * 1000, // 5分钟
};

// 分页配置
const PAGE_CONFIG = {
  PAGE_SIZE: 20,
  MAX_RETRY: 3,
};

// 主题配置
const THEME_CONFIG = {
  LIGHT: {
    primary: '#ffb62f',
    secondary: '#ff8d3c',
    background: '#fffcf5',
    text: '#603813',
    border: '#fde4b3'
  },
  DARK: {
    primary: '#ff9f1c',
    secondary: '#ff7f50',
    background: '#2c2c2c',
    text: '#ffffff',
    border: '#404040'
  }
};

module.exports = {
  CACHE_CONFIG,
  PAGE_CONFIG,
  THEME_CONFIG
};