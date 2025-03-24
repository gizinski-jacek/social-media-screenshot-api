export interface UserBody {
  discordId: string;
  social?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UserBodyPiped {
  discordId: string;
  social?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface ScreenshotData {
  url: string;
  service: string;
  userHandle: string;
  timestamp: string;
}
