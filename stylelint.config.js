/**
 * @type {import("stylelint").Config}
 */
export default {
  extends: [
    'stylelint-config-standard-scss',
    '@stylistic/stylelint-config',
    'stylelint-config-clean-order',
    'stylelint-config-css-modules',
  ],
  overrides: [
    {
      files: ['.svelte', '.svx'].flatMap((ext) => [`*${ext}`, `**/*${ext}`]),
      customSyntax: 'postcss-html',
    },
  ],
  rules: {
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
  ignoreFiles: [
    'dist/**/*',
  ],
};
