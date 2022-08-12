module.exports = {
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/preset-scss"],
  core: {
    builder: 'webpack5'
  },
  staticDirs: ['../src'],
  stories: ["../_src/**/*.stories.@(js|jsx|ts|tsx)"],
};
