import { system } from "@minecraft/server";


export namespace Interval {
    export class MainInterval {
    name: string;
    function: Function;
    tickInterval: number;
    initialTimeout: number = 0;
    startTick: number;

    constructor(name: string, func: Function, tickInterval: number, initialTimeout: number = 0) {
      this.name = name;
      this.function = func;
      this.tickInterval = tickInterval;
      this.initialTimeout = initialTimeout;
      this.startTick = system.currentTick + this.initialTimeout;
    }
  }
  export enum ArrayPlacement {
    Before,
    After
  }
  interface IMainIntervalPlacement {
    placement: ArrayPlacement;
    relativeToIntervalName?: string;
  }

  const intervals: MainInterval[] = [];
  export function addInterval(interval: MainInterval, placement: IMainIntervalPlacement = {placement: ArrayPlacement.After}) {
    if(placement.relativeToIntervalName === undefined) {
      if(placement.placement === ArrayPlacement.After) {
        intervals.push(interval);
      }
      else {
        intervals.unshift(interval);
      }
    }
    else {
      const index = intervals.findIndex(i => i.name === placement.relativeToIntervalName);
      if(index === -1) {
        console.warn(`Interval with name ${placement.relativeToIntervalName} not found. Adding to end of intervals array.`);
        intervals.push(interval);
      }
      else {
        intervals.splice(index, 0, interval);
      }
    }
  }

  let started = false;
  export function start() {
    if(started) return;
    started = true;
    system.runInterval(() => {
      const currentTick = system.currentTick;
      intervals.forEach(interval => {
        if(currentTick >= interval.startTick && (currentTick - interval.startTick) % interval.tickInterval === 0) {
          interval.function();
        }
      });
    }, 1);
  }
}