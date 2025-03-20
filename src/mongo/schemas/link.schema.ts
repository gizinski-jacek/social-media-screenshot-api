import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Link {
  @Prop({ required: true })
  public_id: string;

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

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  type?: string;
}

export const LinkSchema = SchemaFactory.createForClass(Link);

export type LinkDocument = HydratedDocument<Link>;
