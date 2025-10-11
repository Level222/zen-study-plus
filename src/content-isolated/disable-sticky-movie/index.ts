import type { ContentFeature } from '../pages';
import { combineLatest } from 'rxjs';
import { AdditionalStylesheet, cleanable } from '../../utils/cleanup';
import cssText from './disable-sticky-movie.css?inline';

const disableStickyMovie: ContentFeature = ({ pageContent$, syncOptions$ }) => {
  const sheet = new AdditionalStylesheet(cssText);

  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    if (!syncOptions.user.disableStickyMovie.enabled) {
      return;
    }

    const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

    if (!sectionPageType) {
      return;
    }

    const { pageInfo } = sectionPageType;

    if (pageInfo.type !== 'CHAPTER_RESOURCE' || pageInfo.resourceType !== 'movies') {
      return;
    }

    cleanup.add(
      sheet.insert(),
    );
  });
};

export default disableStickyMovie;
