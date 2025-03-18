import { ScreenshotBodyPiped } from '../screenshot.interface';

export interface InstagramData extends ScreenshotBodyPiped {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
}
