import React from 'react';
import { LifeState } from '../types';
import { LifeStateCalculator } from '../utils/lifeStateCalculator';

interface LifeAnimationProps {
  lifeState: LifeState;
}

const LifeAnimation: React.FC<LifeAnimationProps> = ({ lifeState }) => {
  const { state, message, totalExpense } = lifeState;
  const emoji = LifeStateCalculator.getStateEmoji(state);
  const color = LifeStateCalculator.getStateColor(state);
  const progress = LifeStateCalculator.getLifeStateProgress(totalExpense);

  const getAnimationStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '80px',
      margin: '20px auto',
      transition: 'all 0.5s ease-in-out',
      position: 'relative',
      overflow: 'hidden'
    };

    switch (state) {
      case 'luxury':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
          animation: 'pulse 2s infinite'
        };
      case 'modest':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #FF9800, #FF5722)',
          boxShadow: '0 0 20px rgba(255, 152, 0, 0.4)',
          animation: 'shake 0.5s infinite'
        };
      case 'homeless':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #F44336, #D32F2F)',
          boxShadow: '0 0 15px rgba(244, 67, 54, 0.3)',
          animation: 'tremble 0.3s infinite'
        };
      case 'ghost':
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
          boxShadow: '0 0 25px rgba(156, 39, 176, 0.5)',
          animation: 'float 3s ease-in-out infinite'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="life-animation">
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          
          @keyframes tremble {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-3px) translateY(-1px); }
            50% { transform: translateX(3px) translateY(1px); }
            75% { transform: translateX(-1px) translateY(-2px); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .life-animation {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            margin: 20px 0;
          }
          
          .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            margin: 15px 0;
            overflow: hidden;
          }
          
          .progress-fill {
            height: 100%;
            background: ${color};
            border-radius: 4px;
            transition: width 0.5s ease;
          }
          
          .message {
            font-size: 18px;
            font-weight: bold;
            color: white;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          .expense-info {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin: 10px 0;
          }
        `}
      </style>
      
      <div style={getAnimationStyle()}>
        {emoji}
      </div>
      
      <div className="message">{message}</div>
      
      <div className="expense-info">
        総支出: ¥{totalExpense.toLocaleString()}
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="expense-info">
        次のステートまで: ¥{(LifeStateCalculator.getNextStateThreshold(state) - totalExpense).toLocaleString()}
      </div>
    </div>
  );
};

export default LifeAnimation; 