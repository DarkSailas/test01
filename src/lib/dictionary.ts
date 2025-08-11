import type { Language } from '@/hooks/use-settings';

const dictionaries = {
  ru: {
    title: 'ER Nightreign Timer',
    status: 'Состояние',
    timeToShrink: 'До сужения круга',
    totalTime: 'Общее время',
    event: 'Событие',
    time: 'Время',
    manualStart: 'Старт вручную',
    reset: 'Сброс',
    paused: 'Пауза',
    timeMarks: [
        { day: 'ДЕНЬ I', time: '-' },
        { day: 'ДЕНЬ II', time: '-' },
        { day: 'ДЕНЬ III', time: '-' },
    ],
    settings: {
        title: 'Настройки интерфейса',
        description: 'Настройте внешний вид таймера. Изменения сохраняются автоматически.',
        scale: 'Масштаб',
        opacity: 'Прозрачность',
        language: 'Язык',
        autoDetectionStart: 'Авто-старт',
        autoDetectionStop: 'Стоп',
        reset: 'Сбросить',
        close: 'Закрыть',
    },
    bosses: {
      title: 'Уязвимости боссов',
      description: 'Выберите босса для просмотра информации.',
      selectBoss: 'Выберите босса',
      boss: 'Босс',
      best: 'Лучший урон',
      worst: 'Худший урон',
      bestStatus: 'Лучший статус',
      expand: 'Подробнее',
      collapse: 'Свернуть',
      standard: 'Стандарт',
      slash: 'Рубящий',
      strike: 'Дробящий',
      pierce: 'Колющий',
      magic: 'Магия',
      fire: 'Огонь',
      lightning: 'Молния',
      holy: 'Святость',
      bleed: 'Кровотечение',
      frostbite: 'Обморожение',
      poison: 'Яд',
      scarletRot: 'Красная гниль',
      sleep: 'Сон',
      madness: 'Безумие',
      close: 'Закрыть',
    },
    toasts: {
        timersReset: {
            title: "Таймеры сброшены",
            description: "Готов к новому запуску."
        },
        timersStarted: {
            title: "Таймеры запущены вручную",
            description: "Начинается ДЕНЬ I."
        },
        screenshotError: {
            title: "Ошибка скриншота",
            description: "Не удалось обработать изображение. Попробуйте еще раз."
        },
        detectionError: {
            title: "Ошибка распознавания",
            description: "Не удалось определить состояние игры."
        }
    },
    confirmations: {
        reset: {
            title: "Вы уверены?",
            description: "Это действие сбросит все таймеры и общий прогресс."
        },
        resetSettings: {
            title: "Вы уверены?",
            description: "Это сбросит настройки масштаба и прозрачности к значениям по умолчанию. Язык не будет изменен."
        },
        close: {
            title: "Вы уверены?",
            description: "Таймер будет скрыт. Вы можете снова открыть его, перезагрузив страницу."
        },
        confirm: "Подтвердить",
        cancel: "Отмена"
    }
  },
  en: {
    title: 'ER Nightreign Timer',
    status: 'Status',
    timeToShrink: 'Time to shrink',
    totalTime: 'Total time',
    event: 'Event',
    time: 'Time',
    manualStart: 'Manual Start',
    reset: 'Reset',
    paused: 'Paused',
    timeMarks: [
        { day: 'DAY I', time: '-' },
        { day: 'DAY II', time: '-' },
        { day: 'DAY III', time: '-' },
    ],
    settings: {
        title: 'Interface Settings',
        description: 'Customize the timer\'s appearance. Changes are saved automatically.',
        scale: 'Scale',
        opacity: 'Opacity',
        language: 'Language',
        autoDetectionStart: 'Auto-start',
        autoDetectionStop: 'Stop',
        reset: 'Reset',
        close: 'Close',
    },
    bosses: {
      title: 'Boss Weaknesses',
      description: 'Select a boss to see info.',
      selectBoss: 'Select a boss',
      boss: 'Boss',
      best: 'Best damage',
      worst: 'Worst damage',
      bestStatus: 'Best status',
      expand: 'Show Details',
      collapse: 'Collapse',
      standard: 'Standard',
      slash: 'Slash',
      strike: 'Strike',
      pierce: 'Pierce',
      magic: 'Magic',
      fire: 'Fire',
      lightning: 'Lightning',
      holy: 'Holy',
      bleed: 'Bleed',
      frostbite: 'Frostbite',
      poison: 'Poison',
      scarletRot: 'Scarlet Rot',
      sleep: 'Sleep',
      madness: 'Madness',
      close: 'Close',
    },
    toasts: {
        timersReset: {
            title: "Timers Reset",
            description: "Ready for a new run."
        },
        timersStarted: {
            title: "Timers Started Manually",
            description: "DAY I is starting."
        },
        screenshotError: {
            title: "Screenshot Error",
            description: "Failed to process image. Please try again."
        },
        detectionError: {
            title: "Detection Error",
            description: "Could not determine game state."
        }
    },
    confirmations: {
        reset: {
            title: "Are you sure?",
            description: "This action will reset all timers and progress."
        },
        resetSettings: {
            title: "Are you sure?",
            description: "This will reset scale and opacity to their default values. The language setting will not be changed."
        },
        close: {
            title: "Are you sure?",
            description: "The timer will be hidden. You can reopen it by reloading the page."
        },
        confirm: "Confirm",
        cancel: "Cancel"
    }
  },
};

export type Dictionary = typeof dictionaries['ru'];

export const getDictionary = (lang: Language): Dictionary => {
    return dictionaries[lang] ?? dictionaries.en;
};

