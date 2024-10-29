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

export interface Discussion extends ConversationCommon {
  type: ConversationType.DISCUSSION
}
export interface Meeting extends ConversationCommon {
  type: ConversationType.MEETING
  date: DatetimeLocalInputString
  agenda: Agenda
  notes?: string
}
export interface Question extends ConversationCommon {
  type: ConversationType.QUESTION
  /** Message ID of the selected answer */
  answerId?: string
}
export interface Announcement extends ConversationCommon {
  type: ConversationType.ANNOUNCEMENT
}
export interface Poll extends ConversationCommon {
  type: ConversationType.POLL
  multipleAnswers: boolean
  items: PollItem[]
  due: DatetimeLocalInputString
}
export interface Brainstorm extends ConversationCommon {
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

export interface AgendaItem {
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

export interface PollItem {
  index: number
  // title: string
  text: string
  votes: string[]
}

export type Conversation = Discussion | Meeting | Question | Announcement | Poll | Brainstorm

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

export enum MessageType {
  COMMENT = 'comment',
  POLL = 'poll',
  LINK = 'link',
  EVENT = 'event'
}

/**
 * A User or Org. The properties shared by both
 */
export interface Workspace {
  id: string
  name: string
  handle: string
  type: 'org' | 'user'
}
