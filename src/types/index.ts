import type { Doc } from '@bzr/bazaar'

export type Config = Doc & {
  currentTeam: string
  teams: string[]
}

export type Channel = Doc & {
  name: string
  description: string
  archived: boolean
  // type: "team", // vs project
  group: string // needed for permissions & to show channel members if not using team scoped channels

  // workaround
  // members: string[]
  // guests: string[] // read-only members? clients? users for individual permissions (just one conversation)
}

/**
 * String to be used for dates managed by the datetime-local input.
 * The format is "YYYY-MM-DDTHH:mm" which is format returned by the datetime-local input
 * and the result of `Date.prototype.toISOString().slice(0, 16)`
 */
export type DatetimeLocalInputString = string

/**
 * String to be used working with dates consistently
 * Date time string format is "YYYY-MM-DDTHH:mm:ss.sssZ"
 */
export type ISODate = string

export type ConversationCommon = Doc & {
  channelId: string
  title: string
  authorId: string
  archived: boolean
  created: DatetimeLocalInputString
  // TODO: how about edits?

  //
  reactions: string[] // does this belong here? replace string with Reaction object
  // do all types have a message?
  message: string

  editHistory: {
    authorId: string
    ts: DatetimeLocalInputString // Before ts this was the message
    message: string
  }[]

  // Needed for permissions. This is problematic as it should be evident due to channel association.
  group: string
}

export enum ConversationType {
  DISCUSSION = 'discussion',
  MEETING = 'meeting',
  QUESTION = 'question',
  ANNOUNCEMENT = 'announcement',
  POLL = 'poll',
  BRAINSTORM = 'brainstorm'
}

export type Discussion = ConversationCommon & {
  type: ConversationType.DISCUSSION
}
export type Meeting = ConversationCommon & {
  type: ConversationType.MEETING
  date: DatetimeLocalInputString
  agenda: Agenda
  notes?: string
}
export type Question = ConversationCommon & {
  type: ConversationType.QUESTION
  /** Message ID of the selected answer */
  answerId?: string
}
export type Announcement = ConversationCommon & {
  type: ConversationType.ANNOUNCEMENT
}
export type Poll = ConversationCommon & {
  type: ConversationType.POLL
  multipleAnswers: boolean
  items: PollItem[]
  due: DatetimeLocalInputString
}
export type Brainstorm = ConversationCommon & {
  type: ConversationType.BRAINSTORM
  due: DatetimeLocalInputString
}

export type OwnerAgenda = {
  setting: Agency.OWNER
  text: string
}
export type CollabAgenda = {
  setting: Agency.COLLAB
  decision: Agency
  items: AgendaItem[]
  due: DatetimeLocalInputString
}
export type Agenda = OwnerAgenda | CollabAgenda

export type AgendaItem = {
  index: number
  title: string
  text: string
  approved: boolean
  votes: string[]
}

export enum Agency {
  OWNER = 'owner',
  COLLAB = 'collab'
}

export type PollItem = {
  index: number
  // title: string
  text: string
  votes: string[]
}

export type Conversation = Discussion | Meeting | Question | Announcement | Poll | Brainstorm

export type MessageCommon = Doc & {
  conversationId: string
  created: DatetimeLocalInputString
  authorId: string
  group: string
}

export enum MessageType {
  COMMENT = 'comment',
  POLL = 'poll',
  LINK = 'link',
  EVENT = 'event',
  MEETING = 'meeting'
}

export type CommentMessage = MessageCommon & {
  type: MessageType.COMMENT
  text: string
  editHistory: {
    authorId: string
    ts: DatetimeLocalInputString // Before ts this was the message
    text: string
  }[]
}

// For backlinks (mentions)
export type LinkMessage = MessageCommon & {
  type: MessageType.LINK
  url: string
  // ?
}

// For events such as a brainstorming deadline or meeting
export type EventMessage = MessageCommon & {
  type: MessageType.EVENT
  text: string
  // ?
}

export type PollMessage = MessageCommon & {
  type: MessageType.POLL
  multipleAnswers: boolean
  items: PollItem[]
  due: DatetimeLocalInputString
  // ?
}

export type MeetingMessage = MessageCommon & {
  type: MessageType.MEETING
  date: DatetimeLocalInputString
  notes?: string
  // ?
}

export type Message = Doc & {
  conversationId: string
  created: DatetimeLocalInputString
  authorId: string
  type: MessageType
  text: string
  editHistory: {
    authorId: string
    ts: DatetimeLocalInputString // Before ts this was the message
    text: string
  }[]

  group: string
}

/**
 * A User or Org. The properties shared by both
 */
export type Workspace = {
  id: string
  name: string
  handle: string
  type: 'org' | 'user'
}
