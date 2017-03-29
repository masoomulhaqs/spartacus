import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {

    server = {
        baseUrl: 'https://localhost:9002',
        occPrefix: '/rest/v2/'
    };

    site = {
        baseSite: 'electronics',
        language: 'en',
        currency: 'USD'
    };

    // site = {
    //     baseSite: 'apparel-uk',
    //     language: 'en',
    //     currency: 'GBP'
    // };

    authentication = {
        client_id: 'trusted_client',
        client_secret: 'secret',
        userToken: null
    };

    cmsComponentMapping = {
        CMSLinkComponent: 'LinkComponent',
        SimpleResponsiveBannerComponent: 'BannerComponent',
        SimpleBannerComponent: 'BannerComponent',
        BreadcrumbComponent: 'BreadcrumbComponent',
        CmsParagraphComponent: 'ParagraphComponent',
        NavigationComponent: 'NavigationComponent',
        FooterNavigationComponent: 'FooterNavigationComponent',
        CategoryNavigationComponent: 'CategoryNavigationComponent',
        ProductAddToCartComponent: 'AddToCartComponent',
        MiniCartComponent: 'MiniCartComponent',
        ProductCarouselComponent: 'ProductCarouselComponent',
        SearchBoxComponent: 'SearchBoxComponent',
        ProductReferencesComponent: 'ProductReferencesComponent',
        CMSTabParagraphComponent: 'TabParagraphContainerComponent'
    };

}
