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

export type ConversationCommon = Doc & {
  channelId: string
  title: string
  author: string
  archived: boolean
  created: Date
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
  date: Date
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
  pollType: PollType
  items: PollItem[]
  due: Date
}
export type Brainstorm = ConversationCommon & {
  type: ConversationType.BRAINSTORM
  due: Date
}

export type Agenda = {
  setting: Agency
  decision: Agency
  items: AgendaItem[]
  due: Date
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

export enum PollType {
  SINGLE = 'single',
  MULTIPLE = 'multiple'
}

export type Conversation = Discussion | Meeting | Question | Announcement | Poll | Brainstorm

export type Message = Doc & {
  conversationId: string
  created: Date
  author: string
  type: MessageType
  text: string
}

export enum MessageType {
  COMMENT = 'comment',
  POLL = 'poll',
  LINK = 'link',
  EVENT = 'event'
}
