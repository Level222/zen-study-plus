import antfu from '@antfu/eslint-config';

export default antfu({
  lessOpinionated: true,
  stylistic: {
    semi: true,
  },
})
  .overrides({
    'antfu/stylistic/rules': {
      rules: {
        'style/arrow-parens': ['error', 'always'],
        'style/brace-style': ['error', '1tbs'],
        'style/no-extra-semi': 'error',
        'style/quote-props': ['error', 'consistent'],
      },
    },
    'antfu/typescript/rules': {
      rules: {
        'ts/consistent-type-definitions': 'off',
        // Zod
        'ts/no-redeclare': 'off',
      },
    },
  });
