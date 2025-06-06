import { animate, animateChild, AnimationTriggerMetadata } from '@angular/animations';
import { group, query, state, style, transition, trigger } from '@angular/animations';


export const fadeinOutAnimation: AnimationTriggerMetadata = trigger(
  'fadeinOutAnimation',
  [
    state('enter', style({opacity: 1})),

    state('leave', style({opacity: 0})),
    transition('* => enter', [
      style({opacity: 0}),
      group([
        animate('100ms ease-in', style({opacity: 1})),
        query('*', animateChild(), {optional: true}),
      ]),
    ]),
    transition('enter => leave', [
      group([
        query('*', animateChild(), {optional: true}),
        animate('100ms ease-out', style({opacity: 0})),
      ]),
    ]),
  ]
);
