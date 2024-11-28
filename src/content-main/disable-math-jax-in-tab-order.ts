const disableMathJaxInTabOrder = () => {
  const MathJaxHub = window.MathJax?.Hub;

  if (!MathJaxHub) {
    return;
  }

  const inTabOrder = MathJaxHub.config?.menuSettings?.inTabOrder;

  if (inTabOrder !== false) {
    MathJaxHub.Config?.({ menuSettings: { inTabOrder: false } });
  }
};

export default disableMathJaxInTabOrder;
