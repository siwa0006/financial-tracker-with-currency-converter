import { useState, useEffect, useMemo } from 'react';
import { LifeState, Expense } from '../types';
import { LifeStateCalculator } from '../utils/lifeStateCalculator';

interface UseLifeStateReturn {
  lifeState: LifeState;
  progress: number;
  nextThreshold: number;
  remainingAmount: number;
  stateColor: string;
  stateEmoji: string;
  isStateChanging: boolean;
}

export const useLifeState = (expenses: Expense[]): UseLifeStateReturn => {
  const [isStateChanging, setIsStateChanging] = useState(false);
  const [previousState, setPreviousState] = useState<string>('luxury');

  // 総支出を計算
  const totalExpense = useMemo(() => 
    expenses.reduce((sum, expense) => sum + expense.convertedAmount, 0), 
    [expenses]
  );

  // ライフステートを計算
  const lifeState = useMemo(() => 
    LifeStateCalculator.calculateLifeState(totalExpense), 
    [totalExpense]
  );

  // プログレスを計算
  const progress = useMemo(() => 
    LifeStateCalculator.getLifeStateProgress(totalExpense), 
    [totalExpense]
  );

  // 次のステートの閾値を計算
  const nextThreshold = useMemo(() => 
    LifeStateCalculator.getNextStateThreshold(lifeState.state), 
    [lifeState.state]
  );

  // 次のステートまでの残り金額を計算
  const remainingAmount = useMemo(() => {
    if (nextThreshold === Infinity) return 0;
    return Math.max(0, nextThreshold - totalExpense);
  }, [nextThreshold, totalExpense]);

  // ステートの色を取得
  const stateColor = useMemo(() => 
    LifeStateCalculator.getStateColor(lifeState.state), 
    [lifeState.state]
  );

  // ステートの絵文字を取得
  const stateEmoji = useMemo(() => 
    LifeStateCalculator.getStateEmoji(lifeState.state), 
    [lifeState.state]
  );

  // ステート変更の検出とアニメーション制御
  useEffect(() => {
    if (previousState !== lifeState.state) {
      setIsStateChanging(true);
      setPreviousState(lifeState.state);
      
      // アニメーション終了後にフラグをリセット
      const timer = setTimeout(() => {
        setIsStateChanging(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [lifeState.state, previousState]);

  return {
    lifeState,
    progress,
    nextThreshold,
    remainingAmount,
    stateColor,
    stateEmoji,
    isStateChanging
  };
};