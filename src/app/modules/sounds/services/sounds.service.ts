import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/** Contains all sound related functions */
export class SoundsService {

  private introSound: HTMLAudioElement;
  private clickSound: HTMLAudioElement;
  private tickSound: HTMLAudioElement;
  private upSound: HTMLAudioElement;
  private downSound: HTMLAudioElement;
  private solarOn: HTMLAudioElement;
  private solarOff: HTMLAudioElement;
  private agOn: HTMLAudioElement;
  private agOff: HTMLAudioElement;
  private derOn: HTMLAudioElement;
  private derOff: HTMLAudioElement;
  private existingOn: HTMLAudioElement;
  private existingOff: HTMLAudioElement;
  private govOn: HTMLAudioElement;
  private govOff: HTMLAudioElement;
  private ialOn: HTMLAudioElement;
  private ialOff: HTMLAudioElement;
  private parksOn: HTMLAudioElement;
  private parksOff: HTMLAudioElement;
  private transOn: HTMLAudioElement;
  private transOff: HTMLAudioElement;
  private windOn: HTMLAudioElement;
  private windOff: HTMLAudioElement;
  private e3: HTMLAudioElement;
  private e3gm: HTMLAudioElement;
  private postApril: HTMLAudioElement;
  private years: {year: number; audio: HTMLAudioElement}[];
  private loadingScenario: HTMLAudioElement;
  private loadingLayer: HTMLAudioElement;

  private playYearOk: boolean; // when true, its ok to play the year sound.
  private nextYearToPlay: number;
  private lastYearPlayed: number;

  constructor() {
    this.introSound = new Audio();
    this.introSound.src = '../assets/sounds/intro.m4a';
    this.introSound.load();

    this.clickSound = new Audio();
    this.clickSound.src = '../assets/sounds/click.mp3';
    this.clickSound.load();

    this.tickSound = new Audio();
    this.tickSound.src = '../assets/sounds/tick.mp3';
    this.tickSound.load();

    this.upSound = new Audio();
    this.upSound.src = '../assets/sounds/up.mp3';
    this.upSound.load();

    this.downSound = new Audio();
    this.downSound.src = '../assets/sounds/down.mp3';
    this.downSound.load();

    this.solarOn = new Audio();
    this.solarOn.src = '../assets/sounds/Activated/solar-on.mp3';
    this.solarOn.load();

    this.solarOff = new Audio();
    this.solarOff.src = '../assets/sounds/Deactivated/solar-off.mp3';
    this.solarOff.load();

    this.agOn = new Audio();
    this.agOn.src = '../assets/sounds/Activated/ag-on.mp3';
    this.agOn.load();

    this.agOff = new Audio();
    this.agOff.src = '../assets/sounds/Deactivated/ag-off.mp3';
    this.agOff.load();

    this.derOn = new Audio();
    this.derOn.src = '../assets/sounds/Activated/der-on.mp3';
    this.derOn.load();

    this.derOff = new Audio();
    this.derOff.src = '../assets/sounds/Deactivated/der-off.mp3';
    this.derOff.load();

    this.existingOn = new Audio();
    this.existingOn.src = '../assets/sounds/Activated/existing-on.mp3';
    this.existingOn.load();

    this.existingOff = new Audio();
    this.existingOff.src = '../assets/sounds/Deactivated/existing-off.mp3';
    this.existingOff.load();

    this.govOn = new Audio();
    this.govOn.src = '../assets/sounds/Activated/gov-on.mp3';
    this.govOn.load();

    this.govOff = new Audio();
    this.govOff.src = '../assets/sounds/Deactivated/gov-off.mp3';
    this.govOff.load();

    this.ialOn = new Audio();
    this.ialOn.src = '../assets/sounds/Activated/ial-on.mp3';
    this.ialOn.load();

    this.ialOff = new Audio();
    this.ialOff.src = '../assets/sounds/Deactivated/ial-off.mp3';
    this.ialOff.load();

    this.parksOn = new Audio();
    this.parksOn.src = '../assets/sounds/Activated/parks-on.mp3';
    this.parksOn.load();

    this.parksOff = new Audio();
    this.parksOff.src = '../assets/sounds/Deactivated/parks-off.mp3';
    this.parksOff.load();

    this.transOn = new Audio();
    this.transOn.src = '../assets/sounds/Activated/trans-on.mp3';
    this.transOn.load();

    this.transOff = new Audio();
    this.transOff.src = '../assets/sounds/Deactivated/trans-off.mp3';
    this.transOff.load();

    this.windOn = new Audio();
    this.windOn.src = '../assets/sounds/Activated/wind-on.mp3';
    this.windOn.load();

    this.windOff = new Audio();
    this.windOff.src = '../assets/sounds/Deactivated/wind-off.mp3';
    this.windOff.load();

    this.e3 = new Audio();
    this.e3.src = '../assets/sounds/Scenarios/E3.mp3';
    this.e3.load();

    this.e3gm = new Audio();
    this.e3gm.src = '../assets/sounds/Scenarios/E3 Gen Mod.mp3';
    this.e3gm.load();

    this.postApril = new Audio();
    this.postApril.src = '../assets/sounds/Scenarios/Post April.mp3';
    this.postApril.load();

    this.years = [];
    for (let i = 2016; i <= 2045; i++) {
      const a = new Audio();
      a.src = `../assets/sounds/Years/${i}.mp3`;
      a.load();
      this.years.push({year: i, audio: a});
    }
    
    this.playYearOk = true;
  }

  /** Plays the intro music */
  public playIntro() {
    this.introSound.play();
  }

  /** Plays a click sound */
  public playClick() {
    this.clickSound.play();
  }

  /** Plays a tick sound */
  public playTick() {
    this.tickSound.play();
  }
  /** Plays a water droplet sound */
  public playOn(layerName: string) {
    switch (layerName) {
      case 'transmission':
        this.transOn.play();
        break;
      case 'dod':
        this.govOn.play();
        break;
      case 'existing_re':
        this.existingOn.play();
        break;
      case 'solar':
        this.solarOn.play();
        break;
      case 'wind':
        this.windOn.play();
        break;
      case 'der':
        this.derOn.play();
        break;
      case 'parks':
        this.parksOn.play();
        break;
      case 'agriculture':
        this.agOn.play();
        break;
      case 'ial':
        this.ialOn.play();
        break;
    }
  }
  /** Plays a water droplet sound */
  public playOff(layerName: string) {
    switch (layerName) {
      case 'transmission':
        this.transOff.play();
        break;
      case 'dod':
        this.govOff.play();
        break;
      case 'existing_re':
        this.existingOff.play();
        break;
      case 'solar':
        this.solarOff.play();
        break;
      case 'wind':
        this.windOff.play();
        break;
      case 'der':
        this.derOff.play();
        break;
      case 'parks':
        this.parksOff.play();
        break;
      case 'agriculture':
        this.agOff.play();
        break;
      case 'ial':
        this.ialOff.play();
        break;
    }
  }

  public playScenario(scenarioName: string) {
    switch (scenarioName) {
      case 'e3':
        this.e3.play();
        break;
      case 'e3genmod':
        this.e3gm.play();
        break;
      case 'postapril':
        this.postApril.play();
        break;
    }
  }

  public playYear(year: number) {
    this.nextYearToPlay = year;
    if (this.playYearOk) {
      this.lastYearPlayed = year;
      const el = this.years.find(e => e.year == year);
      el.audio.play();
      this.playYearOk = false;
      setTimeout(() => {
        this.playYearOk = true;
        if (this.nextYearToPlay != this.lastYearPlayed) {
          this.playYear(this.nextYearToPlay);
        }
      }, 1500);
    }
  }
}
