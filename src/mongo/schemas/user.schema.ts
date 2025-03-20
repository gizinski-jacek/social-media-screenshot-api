import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Screenshot,
  ScreenshotDocument,
  ScreenshotSchema,
} from './screenshot.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  discordId: string;

  @Prop({ required: true })
  cloudinaryId: string;

  @Prop({ type: [ScreenshotSchema], default: [] })
  blueskyScreenshots: ScreenshotDocument[];

  @Prop({ type: [ScreenshotSchema], default: [] })
  twitterScreenshots: ScreenshotDocument[];

  @Prop({ type: [ScreenshotSchema], default: [] })
  facebookScreenshots: ScreenshotDocument[];

  @Prop({ type: [ScreenshotSchema], default: [] })
  instagramScreenshots: ScreenshotDocument[];

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocumentOverride = {
  name: Types.Subdocument<Types.ObjectId> & Screenshot;
};

export type UserDocument = HydratedDocument<User, UserDocumentOverride>;
