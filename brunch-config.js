exports.config = {
  paths:{
    'public': 'webapp/',
    'watched': ['client/', 'components/']
  },
  plugins: {
    react:{
      autoIncludeCommentBlock: true
    },
    autoReload: {
      enabled: {
        css: true,
        js: true,
        assets: false
      },
      port: [33333]
    }
  },
  files: {
    javascripts: {
      joinTo: {
        'js/app.js': /^client/,
        'js/vendor.js': /^components/
      }
    },
    stylesheets: {
      joinTo: {
        'css/app.css': /^client/
      }
    }
  },
  server: {
    path: 'index.js'
  }
}