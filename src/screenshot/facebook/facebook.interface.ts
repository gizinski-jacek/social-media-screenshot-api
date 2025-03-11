import { BodyPipedData } from 'src/utils/types';

export interface FacebookData extends BodyPipedData {
  userHandle: string | null;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
  type: string;
}
