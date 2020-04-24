import { Inject, Injectable, Optional } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Page, PageMeta } from '../model/page.model';
import { PageMetaResolver } from '../page/page-meta.resolver';
import { CmsService } from './cms.service';
import { resolveApplicable } from '../../util/applicable';

@Injectable({
  providedIn: 'root',
})
export class PageMetaService {
  constructor(
    @Optional()
    @Inject(PageMetaResolver)
    protected resolvers: PageMetaResolver[],
    protected cms: CmsService
  ) {
    this.resolvers = this.resolvers || [];
  }
  /**
   * The list of resolver interfaces will be evaluated for the pageResolvers.
   *
   * TOOD: optimize browser vs SSR resolvers; image, robots and description
   *       aren't needed during browsing.
   * TODO: we can make the list of resolver types configurable
   */
  protected resolverMethods: { [key: string]: string } = {
    title: 'resolveTitle',
    heading: 'resolveHeading',
    description: 'resolveDescription',
    breadcrumbs: 'resolveBreadcrumbs',
    image: 'resolveImage',
    robots: 'resolveRobots',
  };

  getMeta(): Observable<PageMeta> {
    return this.cms.getCurrentPage().pipe(
      filter(Boolean),
      switchMap((page: Page) => {
        const metaResolver = this.getMetaResolver(page);

        if (metaResolver) {
          return this.resolve(metaResolver);
        } else {
          // we do not have a page resolver
          return of(null);
        }
      })
    );
  }

  /**
   * If a `PageResolver` has implemented a resolver interface, the resolved data
   * is merged into the `PageMeta` object.
   * @param metaResolver
   */
  protected resolve(metaResolver: PageMetaResolver): Observable<PageMeta> {
    const resolveMethods: any[] = Object.keys(this.resolverMethods)
      .filter((key) => metaResolver[this.resolverMethods[key]])
      .map((key) =>
        metaResolver[this.resolverMethods[key]]().pipe(
          map((data) => ({
            [key]: data,
          }))
        )
      );

    return combineLatest(resolveMethods).pipe(
      map((data) => Object.assign({}, ...data))
    );
  }

  /**
   * Return the resolver with the best match, based on a score
   * generated by the resolver.
   *
   * Resolvers match by default on `PageType` and `page.template`.
   */
  protected getMetaResolver(page: Page): PageMetaResolver {
    return resolveApplicable(this.resolvers, [page], [page]);
  }
}
