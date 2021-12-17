import { Observer } from './observer.model';
import { Participant } from './participant.model';
import { Event } from './event.model';
import { ChatMessage } from './chat.message.model';

export interface  Program {
  id: number;
  title: string;
  description: string;
  starts: string;
  ends: string;
  updateDate: string;
  hasPhases: boolean;
  isPublic: boolean;
  beingEdited: boolean;
  beingDuplicated: boolean;

  // composed entities
  editor: Observer;
  observers:  Observer[];
  participants: Participant[];
  events: Event[];
  chat_program: ChatMessage[];
}

