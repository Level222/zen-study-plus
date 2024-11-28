import type { ContentFeature } from '../pages';
import { combineLatest, fromEvent } from 'rxjs';

const disableMathJaxFocus: ContentFeature = ({ syncOptions$, dispatchMessageEvent }) => {
  combineLatest([
    syncOptions$,
    fromEvent(document, 'DOMContentLoaded'),
  ]).subscribe(([syncOptions]) => {
    const disableMathJaxFocusOptions = syncOptions.user.disableMathJaxFocus;

    if (!disableMathJaxFocusOptions.enabled) {
      return;
    }

    const mathJaxElements = document.querySelectorAll<HTMLSpanElement>(
      disableMathJaxFocusOptions.mathJaxElementSelectors,
    );

    for (const element of mathJaxElements) {
      element.tabIndex = -1;
    }

    dispatchMessageEvent({
      type: 'DISABLE_MATH_JAX_IN_TAB_ORDER',
    });
  });
};

export default disableMathJaxFocus;
