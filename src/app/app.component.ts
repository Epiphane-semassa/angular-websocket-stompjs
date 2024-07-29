import {AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Subject, takeUntil} from "rxjs";
import {WebsocketService} from "./services/websocket.service";
import {JsonPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgForOf, JsonPipe],
  providers: [WebsocketService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  messages: Array<any> = new Array<any>();
  title = 'angular-websocket-stompjs';
  private messageSubscription$: Subject<void> = new Subject<void>();


  constructor(private websocketService: WebsocketService,  private cdr: ChangeDetectorRef) {

  }

  ngOnDestroy(): void {
    this.messageSubscription$.next();
    this.messageSubscription$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("\nMESSAGES_SIZE_ngOnChanges", this.messages.length);
  }

  ngAfterViewInit(): void {
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.websocketService.initializeWebSocketConnection();
      this.websocketService.getMessages()
        .pipe(takeUntil(this.messageSubscription$))
        .subscribe({
          next: (message: any) => {
            console.log("\n Received message".toUpperCase(), message);
            this.messages = this.messages.concat([message]);
            console.log("\nMESSAGES_SIZE", this.messages.length);
            console.log("\nMESSAGES", this.messages);
            this.cdr.detectChanges();
          }
        });
    } catch (error) {
      console.error('Failed to initialize WebSocket connection', error);
    }
  }

}
