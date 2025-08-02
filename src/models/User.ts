import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface describing the attributes required to create a new user
 * @interface IUserAttrs
 */
export interface IUserAttrs {
  /** Unique identifier for the user */
  userId: string;
  /** User's email address */
  email: string;
  /** User's password - optional for OAuth users */
  password?: string;
  /** Google OAuth ID */
  googleId?: string;
  /** User's display name */
  name?: string;
  /** URL to user's avatar image */
  avatar?: string;
  /** Google OAuth access token */
  googleAccessToken?: string;
  /** Google OAuth refresh token */
  googleRefreshToken?: string;
}

/**
 * Interface describing a User document in MongoDB
 * Extends the base Document interface from Mongoose
 * @interface IUserDoc
 * @extends {Document}
 */
export interface IUserDoc extends Document {
  userId: string;
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  avatar?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  /** Timestamp of the last password change */
  passwordChangedAt: Date;
  /** Token for password reset functionality */
  passwordResetToken: string;
  /** Expiration timestamp for password reset token */
  passwordResetExpires: Date;
}
/**
 * Interface describing the User Model's static methods
 * @interface IUserModel
 * @extends {mongoose.Model<IUserDoc>}
 */
interface IUserModel extends mongoose.Model<IUserDoc> {
  /**
   * Creates a new User document with type checking
   * @param {IUserAttrs} attrs - The attributes to create the user with
   * @returns {IUserDoc} The created user document
   */
  build(attrs: IUserAttrs): IUserDoc;
}

/**
 * Mongoose schema definition for User model
 */
const UserSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    sparse: true  // Allow null/undefined values but index when present
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false // Don't include password in default queries
  },
  googleId: {
    type: String,
    sparse: true // Allow null/undefined values but index when present
  },
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  googleAccessToken: String,
  googleRefreshToken: String,
  refreshTokens: [{
    type: String,
    select: false // Don't include tokens in default queries
  }],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

/**
 * Middleware to set userId to _id before saving
 * This runs before validation to ensure userId is set
 */
UserSchema.pre('validate', function(next) {
  if (!this.userId && this._id) {
    this.userId = this._id.toString();
  }
  next();
});

/**
 * Ensure userId is set after the document is initialized
 */
UserSchema.post('init', function() {
  if (!this.userId && this._id) {
    this.userId = this._id.toString();
    this.save();
  }
});

/**
 * Static method to create a new User with type checking
 */
UserSchema.statics.build = (attrs: IUserAttrs) => {
  return new User(attrs);
};

/**
 * Mongoose model for User collection
 * Implements IUserDoc interface for document methods
 * and IUserModel interface for static methods
 */
const User = mongoose.model<IUserDoc, IUserModel>('User', UserSchema);

export { User };