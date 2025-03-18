import { ScreenshotBodyPiped } from '../screenshot.interface';

export interface BskyData extends ScreenshotBodyPiped {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
}
