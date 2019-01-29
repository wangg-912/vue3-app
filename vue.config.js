const CompressionPlugin = require('compression-webpack-plugin')
const IS_PROD = process.env.NODE_ENV === 'production'
const cdnDomian = 'http://ply4cszel.bkt.clouddn.com'
module.exports = {
  publicPath: IS_PROD
    ? cdnDomian
    : '/',
  chainWebpack: config => {
    // 这里是对环境的配置，不同环境对应不同的BASE_URL，以便axios的请求地址不同
    config
      .plugin('define')
      .tap(args => {
        args[0]['process.env'].BASE_URL = JSON.stringify(process.env.BASE_URL)
        return args
      })
    if (process.env.NODE_ENV === 'production') {
      // #region 启用GZip压缩
      config
        .plugin('compression')
        .use(CompressionPlugin, {
          asset: '[path].gz[query]',
          algorithm: 'gzip',
          test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8,
          cache: true
        })
        .tap(args => {})

      // #endregion #region 忽略生成环境打包的文件

      var externals = {
        vue: 'Vue',
        axios: 'axios',
        'element-ui': 'ELEMENT',
        'vue-router': 'VueRouter',
        vuex: 'Vuex'
      }
      config.externals(externals)
      const cdn = {
        css: [// element-ui css
          '//unpkg.com/element-ui/lib/theme-chalk/index.css'],
        js: [
          // vue
          '//cdn.staticfile.org/vue/2.5.22/vue.min.js',
          // vue-router
          '//cdn.staticfile.org/vue-router/3.0.2/vue-router.min.js',
          // vuex
          '//cdn.staticfile.org/vuex/3.1.0/vuex.min.js',
          // axios
          '//cdn.staticfile.org/axios/0.19.0-beta.1/axios.min.js',
          // element-ui js
          '//unpkg.com/element-ui/lib/index.js'
        ]
      }
      config
        .plugin('html')
        .tap(args => {
          args[0].cdn = cdn
          return args
        })

      // #endregion
    }
  },

  configureWebpack: config => {
    if (IS_PROD) {
      return {
        plugins: [new CompressionPlugin({
            filename: '[path].gz[query]', //  目标文件名称。[path] 被替换为原始文件的路径和 [query] 查询
            algorithm: 'gzip', // 使用 gzip 压缩
            test: new RegExp('\\.(js|css)$'), // 处理与此正则相匹配的所有文件
            threshold: 10240, // 只处理大于此大小的文件
            minRatio: 0.8 // 最小压缩比达到 0.8 时才会被压缩
          })]
      }
    }
  },

  // 它支持webPack-dev-server的所有选项
  devServer: {
    port: 7777, // 端口号
    https: false, // https:{type:Boolean}
    open: true, //配置自动启动浏览器
  }
}
