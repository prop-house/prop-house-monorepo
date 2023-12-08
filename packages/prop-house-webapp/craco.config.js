module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      });
      return webpackConfig;
    },
  },
  eslint: {
    enable: true,
    configure: {
      parser: '@babel/eslint-parser',
    },
  },
};
