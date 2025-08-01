import { LifeState, LIFE_STATES } from '../types';

export class LifeStateCalculator {
  static calculateLifeState(totalExpense: number): LifeState {
    let state: keyof typeof LIFE_STATES = 'luxury';
    let message = '';
    let animation = '';

    // 支出総額に基づいてライフステートを決定
    if (totalExpense >= LIFE_STATES.ghost.min) {
      state = 'ghost';
      message = LIFE_STATES.ghost.message;
      animation = LIFE_STATES.ghost.animation;
    } else if (totalExpense >= LIFE_STATES.homeless.min) {
      state = 'homeless';
      message = LIFE_STATES.homeless.message;
      animation = LIFE_STATES.homeless.animation;
    } else if (totalExpense >= LIFE_STATES.modest.min) {
      state = 'modest';
      message = LIFE_STATES.modest.message;
      animation = LIFE_STATES.modest.animation;
    } else {
      state = 'luxury';
      message = LIFE_STATES.luxury.message;
      animation = LIFE_STATES.luxury.animation;
    }

    return {
      totalExpense,
      state,
      message,
      animation
    };
  }

  static getLifeStateProgress(totalExpense: number): number {
    // 次のステートまでの進捗を計算（0-100%）
    if (totalExpense < LIFE_STATES.modest.min) {
      return (totalExpense / LIFE_STATES.modest.min) * 100;
    } else if (totalExpense < LIFE_STATES.homeless.min) {
      return ((totalExpense - LIFE_STATES.modest.min) / (LIFE_STATES.homeless.min - LIFE_STATES.modest.min)) * 100;
    } else if (totalExpense < LIFE_STATES.ghost.min) {
      return ((totalExpense - LIFE_STATES.homeless.min) / (LIFE_STATES.ghost.min - LIFE_STATES.homeless.min)) * 100;
    } else {
      return 100;
    }
  }

  static getNextStateThreshold(currentState: keyof typeof LIFE_STATES): number {
    switch (currentState) {
      case 'luxury':
        return LIFE_STATES.modest.min;
      case 'modest':
        return LIFE_STATES.homeless.min;
      case 'homeless':
        return LIFE_STATES.ghost.min;
      default:
        return Infinity;
    }
  }

  static getStateColor(state: keyof typeof LIFE_STATES): string {
    switch (state) {
      case 'luxury':
        return '#4CAF50'; // 緑
      case 'modest':
        return '#FF9800'; // オレンジ
      case 'homeless':
        return '#F44336'; // 赤
      case 'ghost':
        return '#9C27B0'; // 紫
      default:
        return '#2196F3'; // 青
    }
  }

  static getStateEmoji(state: keyof typeof LIFE_STATES): string {
    switch (state) {
      case 'luxury':
        return '🏰';
      case 'modest':
        return '🏠';
      case 'homeless':
        return '🌉';
      case 'ghost':
        return '👻';
      default:
        return '💰';
    }
  }
} 