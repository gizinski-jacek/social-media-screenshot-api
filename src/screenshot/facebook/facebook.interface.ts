import { ScreenshotBodyPiped } from '../screenshot.interface';

export interface FacebookData extends ScreenshotBodyPiped {
  userHandle: string | null;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
  type: string;
}
