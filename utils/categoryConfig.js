/**
 * 菜品类目配置文件
 */

// 菜品类目数组
const CATEGORIES = [
  { id: 0, icon: '../../images/category-icon/qiancai.png', name: '前菜' },
  { id: 1, icon: '../../images/category-icon/huncai.png', name: '荤菜' },
  { id: 2, icon: '../../images/category-icon/sucai.png', name: '素菜' },
  { id: 3, icon: '../../images/category-icon/tang.png', name: '汤菜' },
  { id: 4, icon: '../../images/category-icon/zhushi.png', name: '主食' },
  { id: 5, icon: '../../images/category-icon/tiandian.png', name: '甜点' },
  { id: 6, icon: '../../images/category-icon/shuiguo.png', name: '水果' },
];

// 将类目数组转换为名称数组，用于选择器组件
const CATEGORY_NAMES = CATEGORIES.map(category => category.name);

// 导出
module.exports = {
  CATEGORIES,
  CATEGORY_NAMES
};