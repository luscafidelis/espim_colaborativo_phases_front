// configure default backend location
//export const ESPIM_API = 'https://espim-back.herokuapp.com/';
export const ESPIM_API = 'http://localhost:8000/';
//export const CHANNEL_URL = 'wss://espim-back.herokuapp.com/ws/chat/';
export const CHANNEL_URL = 'ws://localhost:8000/ws/chat/';


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

//Configura Circle
export const ESPIM_REST_CircleTypes: string = ESPIM_API +  'circle-types/';

//Configura Circle Event
export const ESPIM_REST_SameCircleEvents: string = ESPIM_API +  'same-circle-events/';

//Configura Circle Event
export const ESPIM_REST_CustomCircleEvents: string = ESPIM_API +  'custom-circle-events/';

//Configura Circle Event
export const ESPIM_REST_RespostCircleEvents: string = ESPIM_API +  'respost-circle-events/';

//Configura Circle Event
export const ESPIM_REST_TargetCircleEvents: string = ESPIM_API +  'target-circle-events/';

//Configura Additional Resource
export const ESPIM_REST_AdditionalResource: string = ESPIM_API +  'additional-resource/';

//Configura Alert And Notification Buttons
export const ESPIM_REST_AlertNotificationButtons: string = ESPIM_API +  'alert-notification-buttons/';

//Configura ExpertsProgramPublicade
export const ESPIM_REST_ExpertsProgramPublicade: string = ESPIM_API +  'experts-program-publicade/';

//Configura PhasePublicade
export const ESPIM_REST_PhasePublicade: string = ESPIM_API +  'phase-publicade/';

//Configura ProgramPublicade
export const ESPIM_REST_ProgramPublicade: string = ESPIM_API +  'program-publicade/';


// config default page size
export const PAGE_SIZE = 10;

