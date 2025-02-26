import { BodyPipedData } from 'src/utils/types';

export interface FacebookData extends BodyPipedData {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
  type: string;
}
