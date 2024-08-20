import { Colors } from 'discord.js';

const colorValues = Object.values(Colors);

export function randomColor() {
  return colorValues[Math.floor(Math.random() * colorValues.length)];
};