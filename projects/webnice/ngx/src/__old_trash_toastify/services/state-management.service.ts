import { ComponentRef, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, Subject, take } from 'rxjs';
import { ToastComponent } from '../components';
import { ToastifyRemoteControl } from '../models';


type RemoteControlType = ToastifyRemoteControl;

@Injectable({
  providedIn: 'root',
})
export class StateManagementService {
  public instanceStatesSubject: BehaviorSubject<
    Map<string, RemoteControlType>
  > = new BehaviorSubject(new Map());
  public instanceStates$ = this.instanceStatesSubject.asObservable();
  public instances: Map<string, ComponentRef<any>> = new Map();
  private instanceCloseSubject: Subject<{ id: string; data?: any }> =
    new Subject();

  public addInstance(
    componentRef: ComponentRef<any>,
    remoteControl: RemoteControlType
  ): void {
    this.instances.set(remoteControl.id, componentRef);
    this.updateState(remoteControl.id, remoteControl);
  }

  public instanceExists(id: string): boolean {
    return this.instances.has(id);
  }

  public getInstance(id: string): ComponentRef<ToastComponent> | undefined {
    return this.instances.get(id);
  }
  public deleteInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  public getDialogStates$(): Observable<Map<string, RemoteControlType>> {
    return this.instanceStatesSubject.asObservable();
  }

  public getDialogCloseSubject(): Subject<{ id: string; data?: any }> {
    return this.instanceCloseSubject;
  }

  public listenForClose(id: string): Observable<any> {
    return this.instanceCloseSubject.asObservable().pipe(
      filter((event) => event.id === id),
      map((event) => event.data),
      take(1)
    );
  }

  public updateState(id: string, remoteControl: RemoteControlType): void {
    const currentStates = this.instanceStatesSubject.getValue();
    currentStates.set(id, remoteControl);
    this.instanceStatesSubject.next(currentStates);
  }

  public removeDialogState(id: string): void {
    const currentStates = this.instanceStatesSubject.getValue();
    if (currentStates.delete(id)) {
      this.instanceStatesSubject.next(currentStates);
    }
  }

  public sendCloseData(id: string, data?: any): void {
    this.instanceCloseSubject.next({ id, data });
  }

  closeEmmit(id: string, data?: any) {
    this.deleteInstance(id);
    this.removeDialogState(id);
    this.sendCloseData(id, data);
  }
}
