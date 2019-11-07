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
  public playUp() {
    this.upSound.play();
  }
  /** Plays a water droplet sound */
  public playDown() {
    this.downSound.play();
  }
}
