const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

function resolve(dir) {
    return path.join(__dirname, '.', dir)
}

// 这里覆盖webpack配置，增加路径别名
module.exports = override(
    //路径别名
    addWebpackAlias({
        // '@': path.resolve(__dirname, 'src')
    }),
);
