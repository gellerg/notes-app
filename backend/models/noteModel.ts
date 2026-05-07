import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: authorSchema,
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'notes',
  }
);

export const Note = mongoose.model('Note', noteSchema);