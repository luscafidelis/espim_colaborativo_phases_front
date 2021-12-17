export class ChatMessage {
    public id: number;
    public program: number;
    public day_message: string;
    //public time_message : string;
    public user_message: string;
    public message: string;

    constructor(chat?: any) {
        if (chat) {
          this.id = chat.id ? chat.id : null;
          this.program = chat.program;
          this.day_message = chat.day_message;
          //this.time_message =
          this.user_message = chat.user_message;
          this.message = chat.message;
        } else {
          this.id = null;
          this.program = null;
          this.day_message = '';
          //this.time_message = '';
          this.user_message = '';
          this.message = '';
        }
    }
}