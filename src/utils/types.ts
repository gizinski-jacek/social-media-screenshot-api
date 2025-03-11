export interface BodyData {
  postUrl: string;
  commentsDepth: number;
  discordId: string;
  nitter: boolean;
}

export interface BodyPipedData extends Omit<BodyData, 'postUrl'> {
  postUrlData: URL;
  service: string;
}

export interface SupportedServices {
  [name: string]: { dbArrayFieldName: string };
}
