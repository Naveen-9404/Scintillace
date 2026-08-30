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
      required: true,
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
  },
  {
    _id: false,
  }
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
      required: true,
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

// A user may belong to only one team for a given event.
teamSchema.index(
  {
    event: 1,
    'members.user': 1,
  },
  {
    unique: true,
  },
);

const Team = mongoose.model('Team', teamSchema);

export default Team;
