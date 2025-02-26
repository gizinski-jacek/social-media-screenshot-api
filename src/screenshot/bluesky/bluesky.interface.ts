import { BodyPipedData } from 'src/utils/types';

export interface BskyData extends BodyPipedData {
  userHandle: string;
  postOwnerProfileLink: string;
  postId: string;
  originalPostUrl: string;
}
