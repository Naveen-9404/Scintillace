import mongoose from 'mongoose';
import {
  TEAM_STATUS,
  TEAM_MEMBER_ROLE,
} from '../constants/team.constants.js';

/**
 * Team Member Schema
 */
const teamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    participantName: {
      type: String,
      trim: true,
      default: '',
    },

    participantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    participantPhone: {
      type: String,
      trim: true,
      default: '',
    },

    collegeId: {
      type: String,
      trim: true,
      default: '',
    },

    department: {
      type: String,
      trim: true,
      default: '',
    },

    yearOfStudy: {
      type: String,
      trim: true,
      default: '',
    },

    role: {
      type: String,
      enum: Object.values(TEAM_MEMBER_ROLE),
      default: TEAM_MEMBER_ROLE.MEMBER,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }
  // _id: true (default) allows stable identities
);

/**
 * Team Schema
 */
const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    projectTitle: {
      type: String,
      trim: true,
      default: '',
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    festival: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Festival',
      required: true,
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    members: {
      type: [teamMemberSchema],
      default: [],
    },

    maxMembers: {
      type: Number,
      required: true,
      min: 2,
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(TEAM_STATUS),
      default: TEAM_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Indexes
 */

// Fast lookup by leader
teamSchema.index({
  leader: 1,
});

// Fast lookup by event
teamSchema.index({
  event: 1,
});

// Fast lookup by festival
teamSchema.index({
  festival: 1,
});

// Prevent duplicate team names within the same event
teamSchema.index(
  {
    event: 1,
    teamName: 1,
  },
  {
    unique: true,
  }
);

// Fast lookup for member searches
teamSchema.index({
  'members.user': 1,
});

teamSchema.index(
  {
    event: 1,
    'members.user': 1,
  }
);

const Team = mongoose.model('Team', teamSchema);

export default Team;
