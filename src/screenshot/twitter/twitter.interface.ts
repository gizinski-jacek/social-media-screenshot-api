import { ScreenshotBodyPiped } from '../screenshot.interface';

export interface TwitterData extends ScreenshotBodyPiped {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
}
