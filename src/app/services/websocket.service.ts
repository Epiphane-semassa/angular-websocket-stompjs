import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import SockJS from "sockjs-client";
import * as Stomp from 'stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private serverUrl = 'path/to/api/server/websocket';
  private stompClient: Stomp.Client = null;
  private connected: boolean = false;
  private token: string = "";

  private messageSubject: Subject<any> = new Subject<any>();

  constructor() {
  }

  getConnected() {
    return this.connected;
  }

  async initializeWebSocketConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("initializeWebSocketConnection");

      const ws = new SockJS(this.serverUrl);
      this.stompClient = Stomp.over(<WebSocket>ws);

      //add this line's bloc if your channel required auth
      const headers = {
        'Authorization': 'Bearer ' + this.token
      };

      const that = this;

      this.stompClient.connect(headers, function (frame) {
        that.connected = true;
        console.log('Websocket Connected: ' + frame);

        that.stompClient.subscribe('/realtime/festivals/online', (message) => {
          if (message.body) {
            that.messageSubject.next(JSON.parse(message.body));
          }
        });
        resolve();
      }, function (error) {
        console.error('Websocket Not Connected : ' + error);
        that.connected = false;
        reject(error);
      });
    });
  }

  getMessages() {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected');
        this.connected = false;
      });
    }
  }

}
