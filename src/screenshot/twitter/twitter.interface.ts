import { BodyPipedData } from 'src/utils/types';

export interface TwitterData extends BodyPipedData {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
}
