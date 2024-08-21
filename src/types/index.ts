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
  // group: groupId, // needed for permissions & to show channel members if not using team scoped channels
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
  created: ISODate
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

export interface Discussion extends ConversationCommon {
  type: ConversationType.DISCUSSION
}
export interface Meeting extends ConversationCommon {
  type: ConversationType.MEETING
  date: ISODate
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
  due: ISODate
}
export interface Brainstorm extends ConversationCommon {
  type: ConversationType.BRAINSTORM
  due: ISODate
}

export type OwnerAgenda = {
  setting: Agency.OWNER
  text: string
}
export type CollabAgenda = {
  setting: Agency.COLLAB
  decision: Agency
  items: AgendaItem[]
  due: ISODate
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
  created: ISODate
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
