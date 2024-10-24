import antfu from '@antfu/eslint-config';

export default antfu({
  lessOpinionated: true,
  stylistic: {
    semi: true,
  },
  rules: {
    'style/arrow-parens': ['error', 'always'],
    'style/brace-style': ['error', '1tbs'],
    'style/quote-props': ['error', 'consistent'],
    'ts/consistent-type-definitions': 'off',
    // Recommended to use TypeScript compiler for accuracy
    'ts/no-redeclare': 'off',
    // Not required for TypeScript
    'no-undef': 'off',
  },
});
