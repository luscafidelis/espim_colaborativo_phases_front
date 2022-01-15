// configure default backend location
export const ESPIM_API = 'https://espim-back.herokuapp.com/';
//export const ESPIM_API = 'http://localhost:8000/';
export const CHANNEL_URL = 'wss://espim-back.herokuapp.com/ws/chat/';
//export const CHANNEL_URL = 'ws://localhost:8000/ws/chat/';


// configure participants module url
export const ESPIM_REST_Participants: string = ESPIM_API + 'participants/';

// configure observers module url
export const ESPIM_REST_Observers: string = ESPIM_API + 'observers/';

// configure participants module url
export const ESPIM_REST_Programs: string = ESPIM_API + 'programs/';

// configure events module url
export const ESPIM_REST_Events: string = ESPIM_API + 'events/';

// configure interventions module url
export const ESPIM_REST_Interventions: string = ESPIM_API + 'interventions/';

// configure triggers module url
export const ESPIM_REST_Triggers: string = ESPIM_API + 'triggers/';

// configure sensors module url
export const ESPIM_REST_Sensors: string = ESPIM_API + 'sensors/';

//configura chat module url
export const ESPIM_REST_Chat: string = ESPIM_API +  'chat-message/';

//configura chat module url
export const ESPIM_REST_Editores: string = ESPIM_API +  'editores/';

//configura chat module url
export const ESPIM_REST_Phases: string = ESPIM_API +  'phases/';

// config default page size
export const PAGE_SIZE = 4;

