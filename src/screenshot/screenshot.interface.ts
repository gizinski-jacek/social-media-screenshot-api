export interface ScreenshotBody {
  postUrl: string;
  commentsDepth: number;
  discordId: string;
  nitter: boolean;
}

export interface ScreenshotBodyPiped extends Omit<ScreenshotBody, 'postUrl'> {
  postUrlData: URL;
  service: string;
}

export interface ScreenshotSupportedServices {
  [name: string]: { dbArrayFieldName: string };
}
