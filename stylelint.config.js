/**
 * @type {import("stylelint").Config}
 */
export default {
  extends: [
    'stylelint-config-standard',
    '@stylistic/stylelint-config',
    'stylelint-config-clean-order',
    'stylelint-config-css-modules',
  ],
  ignoreFiles: [
    'dist/**/*',
  ],
};
