import React from 'react';
import { Expense, LifeState, AppSettings } from '../types';
import LifeAnimation from '../components/LifeAnimation';
import ExpenseForm from '../components/ExpenseForm';

interface DashboardProps {
  lifeState: LifeState;
  onAddExpense: (expense: Expense) => void;
  defaultCurrency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  lifeState, 
  onAddExpense, 
  defaultCurrency 
}) => {
  return (
    <div className="dashboard-grid">
      <div>
        <LifeAnimation lifeState={lifeState} />
      </div>
      <div>
        <ExpenseForm 
          onAddExpense={onAddExpense} 
          defaultCurrency={defaultCurrency} 
        />
      </div>
    </div>
  );
};

export default Dashboard;