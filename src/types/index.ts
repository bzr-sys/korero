import type { Doc, User } from '@bzr/bazaar'

export type Config = Doc & {
  currentTeam: string
  teams: string[]
}

export type Channel = Doc & {
  name: string
  description: string
  archived: boolean
  // type: "team", // vs project
  // group: groupId, // needed for permissions & to show channel members if not using team scoped channels
}

/**
 * String to be used for dates managed by the datetime-local input.
 * The format is "YYYY-MM-DDTHH:mm" which is the result of Date.prototype.toISOString().slice(0, 16).
 */
export type DatetimeLocalInputString = string

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

  // Needed for permissions. This is problematic as it should be evident due to channel association.
  // group: groupId,
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
  // TODO add "interactive" features such as intention setting
}
export type Question = ConversationCommon & {
  type: ConversationType.QUESTION
  answer?: string // message ID
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

export type Agenda = {
  setting: Agency
  decision: Agency
  items: AgendaItem[]
  due: DatetimeLocalInputString
}

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

export type Message = Doc & {
  conversationId: string
  created: DatetimeLocalInputString
  authorId: string
  type: MessageType
  text: string
}

export enum MessageType {
  COMMENT = 'comment',
  POLL = 'poll',
  LINK = 'link',
  EVENT = 'event'
}
