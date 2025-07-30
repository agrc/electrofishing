const config = {
  addons: [
    '@storybook/addon-links',
    '@storybook/preset-scss',
    '@chromatic-com/storybook',
    '@storybook/addon-docs'
  ],

  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  }
};
export default config;
