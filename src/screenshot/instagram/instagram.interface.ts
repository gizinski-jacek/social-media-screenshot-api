import { BodyPipedData } from 'src/utils/types';

export interface InstagramData extends BodyPipedData {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
}
