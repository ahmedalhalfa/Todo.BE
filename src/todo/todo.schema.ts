import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Todo extends Document {
  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Complete project',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'The description of the todo item',
    example: 'Finish implementing all required features',
    required: false,
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'The completion status of the todo item',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  completed: boolean;

  @ApiProperty({
    description: 'The ID of the user who owns this todo',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo); 