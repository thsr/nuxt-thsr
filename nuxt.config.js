module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'thsr.io',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'thsr.io' }
    ],
    link: [
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' }
    ]
  },
  /*
  ** Global CSS
  */
  css: ['~/assets/css/main.css'],
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios']
    /*
    ** Run ESLINT on save
    */
    // extend (config, ctx) {
    //   if (ctx.isClient) {
    //     config.module.rules.push({
    //       enforce: 'pre',
    //       test: /\.(js|vue)$/,
    //       loader: 'eslint-loader',
    //       exclude: /(node_modules)/
    //     })
    //   }
    // }
  }
}
