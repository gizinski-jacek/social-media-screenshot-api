import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LinkDocument = HydratedDocument<Link>;

@Schema({ timestamps: true })
export class Link {
  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  originalPostUrl: string;

  @Prop({ required: true })
  screenshotUrl: string;

  @Prop({ required: true })
  userHandle: string;

  @Prop({ required: true })
  postOwnerProfileLink: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  commentsDepth: number;

  @Prop()
  type?: string;
}

export const LinkSchema = SchemaFactory.createForClass(Link);
