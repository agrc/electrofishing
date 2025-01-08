const config = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-scss',
    '@chromatic-com/storybook'
  ],
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};
export default config;