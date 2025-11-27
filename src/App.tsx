
import { useState } from 'react';
import { KitchenConfig } from './components/KitchenConfig';
import { RecipeList } from './components/RecipeList';
import { RecipeForm } from './components/RecipeForm';
import { MealSetup } from './components/MealSetup';
import { ScheduleGrid } from './components/ScheduleGrid';
import { FeastManager } from './components/FeastManager';
import { CookSetup } from './components/CookSetup';
import { Plus } from 'lucide-react';
import type { Recipe } from './types/types';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecipe(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-friendly header */}
        <header className="bg-gradient-to-r from-red-900 to-red-800 text-white p-4 md:p-6 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold">Feast.ai</h1>
            <p className="text-sm md:text-base text-red-100 mt-1">Meal coordination made easy</p>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          {/* 0. Feast Manager */}
          <FeastManager />

          {/* 1. Cook Setup */}
          <CookSetup />

          {/* 2. Kitchen Setup */}
          <section className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Kitchen Setup</h2>
            <KitchenConfig />
          </section>

          {/* 2. Your Menu */}
          <section className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Your Menu</h2>
              <button
                onClick={() => {
                  setEditingRecipe(undefined);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Add Dish</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            <RecipeList onEdit={handleEdit} />
          </section>

          {/* 3. Plan Meal */}
          <section className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Plan Meal</h2>
            <MealSetup />
          </section>

          {/* 4. Cooking Schedule & 5. Dish Summary - rendered by ScheduleGrid */}
          <ScheduleGrid />
        </div>

        {isFormOpen && <RecipeForm onClose={handleCloseForm} recipe={editingRecipe} />}
      </div>
    </div>
  );
}

export default App
