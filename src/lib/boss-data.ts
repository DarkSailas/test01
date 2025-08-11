import React from 'react';
import {
    Shield,
    Sword,
    Hammer,
    ArrowUp,
    Sparkles,
    Flame,
    Zap,
    Sun,
    Droplets,
    Snowflake,
    Skull,
    Bed,
    BrainCircuit,
    type LucideIcon,
  } from 'lucide-react';

  export const damageTypes = {
      standard: { Icon: Shield, labelKey: 'standard' },
      slash: { Icon: Sword, labelKey: 'slash' },
      strike: { Icon: Hammer, labelKey: 'strike' },
      pierce: { Icon: ArrowUp, labelKey: 'pierce' },
      magic: { Icon: Sparkles, labelKey: 'magic' },
      fire: { Icon: Flame, labelKey: 'fire' },
      lightning: { Icon: Zap, labelKey: 'lightning' },
      holy: { Icon: Sun, labelKey: 'holy' },
      bleed: { Icon: Droplets, labelKey: 'bleed' },
      frostbite: { Icon: Snowflake, labelKey: 'frostbite' },
      poison: { Icon: Skull, labelKey: 'poison' },
      scarletRot: { Icon: Skull, labelKey: 'scarletRot' }, // Using skull again
      sleep: { Icon: Bed, labelKey: 'sleep' },
      madness: { Icon: BrainCircuit, labelKey: 'madness' },
    };

  export type DamageType = keyof typeof damageTypes;
  export type ResistanceValue = string;

  export interface Boss {
    name: string;
    name_ru: string;
    resistances: {
      [key in DamageType]: ResistanceValue;
    };
  }

  export const bossData: Boss[] = [
      {
          name: "Gladius (Dog)",
          name_ru: "Гладиус (Собака)",
          resistances: {
              standard: "+0%", slash: "+0%", strike: "+0%", pierce: "+10%",
              magic: "+0%", fire: "-50%", lightning: "+0%", holy: "+35%",
              bleed: "252", frostbite: "541", poison: "541", scarletRot: "252",
              sleep: "154", madness: "-",
          },
      },
      {
          name: "Adel (Dinosaur)",
          name_ru: "Адель (Динозавр)",
          resistances: {
              standard: "+0%", slash: "+0%", strike: "+0%", pierce: "+0%",
              magic: "+0%", fire: "-20%", lightning: "-50%", holy: "+0%",
              bleed: "541", frostbite: "154", poison: "154", scarletRot: "154",
              sleep: "154", madness: "-",
          },
      },
      {
          name: "Gnoster (Moth)",
          name_ru: "Гностер (Мотылек)",
          resistances: {
              standard: "+15%", slash: "+25%", strike: "+15%", pierce: "+25%",
              magic: "-50%", fire: "+40%", lightning: "-10%", holy: "-10%",
              bleed: "154", frostbite: "541", poison: "541", scarletRot: "154",
              sleep: "154", madness: "-",
          },
      },
      {
          name: "Gnoster (Scorpion)",
          name_ru: "Гностер (Скорпион)",
          resistances: {
              standard: "-10%", slash: "-20%", strike: "+20%", pierce: "+10%",
              magic: "-10%", fire: "+35%", lightning: "-10%", holy: "-10%",
              bleed: "154", frostbite: "154", poison: "252", scarletRot: "154",
              sleep: "154", madness: "-",
          },
      },
      {
          name: "Maris (Whale)",
          name_ru: "Марис (Кит)",
          resistances: {
              standard: "+0%", slash: "+15%", strike: "-20%", pierce: "-10%",
              magic: "-20%", fire: "-50%", lightning: "+40%", holy: "-15%",
              bleed: "-", frostbite: "252", poison: "-", scarletRot: "252",
              sleep: "-", madness: "-",
          },
      },
      {
          name: "Libra (Ram)",
          name_ru: "Либра (Баран)",
          resistances: {
              standard: "+0%", slash: "+10%", strike: "+0%", pierce: "+0%",
              magic: "-20%", fire: "+20%", lightning: "+0%", holy: "+35%",
              bleed: "252", frostbite: "252", poison: "154", scarletRot: "154",
              sleep: "-", madness: "154",
          },
      },
      {
          name: "Fulghor (Centaur)",
          name_ru: "Фулгор (Кентавр)",
          resistances: {
              standard: "+0%", slash: "+0%", strike: "+0%", pierce: "+0%",
              magic: "+0%", fire: "+0%", lightning: "+20%", holy: "-30%",
              bleed: "154", frostbite: "154", poison: "154", scarletRot: "154",
              sleep: "154", madness: "-",
          },
      },
      {
          name: "Caligo (Dragon)",
          name_ru: "Калиго (Дракон)",
          resistances: {
              standard: "+0%", slash: "-15%", strike: "+15%", pierce: "-10%",
              magic: "-20%", fire: "+35%", lightning: "-20%", holy: "-20%",
              bleed: "252", frostbite: "541", poison: "252", scarletRot: "252",
              sleep: "541", madness: "-",
          },
      },
      {
          name: "The Shape Of Night (The Tarnished)",
          name_ru: "Форма Ночи (Погасший)",
          resistances: {
              standard: "+0%", slash: "+15%", strike: "-10%", pierce: "+10%",
              magic: "+0%", fire: "+20%", lightning: "+0%", holy: "+35%",
              bleed: "-", frostbite: "-", poison: "-", scarletRot: "252",
              sleep: "541", madness: "-",
          },
      },
      {
          name: "Heolstor (Empyrean)",
          name_ru: "Хеолстор (Неземной)",
          resistances: {
              standard: "+0%", slash: "-10%", strike: "+10%", pierce: "+15%",
              magic: "+0%", fire: "+0%", lightning: "+20%", holy: "+20%",
              bleed: "-", frostbite: "-", poison: "-", scarletRot: "252",
              sleep: "541", madness: "-",
          },
      },
  ];
