import { ScreenshotSupportedServices } from 'src/screenshot/screenshot.interface';

export const supportedServicesData: ScreenshotSupportedServices = {
  bsky: { dbArrayFieldName: 'blueskyScreenshots' },
  twitter: { dbArrayFieldName: 'twitterScreenshots' },
  facebook: { dbArrayFieldName: 'facebookScreenshots' },
  instagram: { dbArrayFieldName: 'instagramScreenshots' },
};
