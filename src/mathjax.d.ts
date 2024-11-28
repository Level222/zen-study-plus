declare module 'mathjax' {
  interface MathJax {
    Hub?: Hub | undefined;
  }

  interface Hub {
    config?: Config | undefined;
    Config?: ((config: Config) => void) | undefined;
  }

  interface Config {
    menuSettings?: MenuSettings | undefined;
  }

  interface MenuSettings {
    inTabOrder?: boolean | undefined;
  }
}

// eslint-disable-next-line no-var, vars-on-top
var MathJax: import('mathjax').MathJax | undefined;
