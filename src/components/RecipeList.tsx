import React from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Flame, Snowflake, Edit } from 'lucide-react';

export const RecipeList: React.FC<{ onEdit: (recipe: any) => void }> = ({ onEdit }) => {
    const { recipes, deleteRecipe } = useStore();

    if (recipes.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-500">No recipes added yet. Add your first dish!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200 relative group hover:shadow-md transition-shadow">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(recipe)}
                            className="p-2 text-gray-400 hover:text-blue-500 bg-white rounded shadow-sm"
                            title="Edit recipe"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => deleteRecipe(recipe.id)}
                            className="p-2 text-gray-400 hover:text-red-500 bg-white rounded shadow-sm"
                            title="Delete recipe"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-start justify-between mb-2 pr-20">
                        <h3 className="font-bold text-base md:text-lg text-gray-800">{recipe.name}</h3>
                        {recipe.servingRequirement === 'hot' ? (
                            <span title="Serve Hot">
                                <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            </span>
                        ) : (
                            <span title="Serve Cold">
                                <Snowflake className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            </span>
                        )}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                        <div>
                            <span className="font-medium">{recipe.steps.length}</span> cooking step{recipe.steps.length !== 1 ? 's' : ''}
                        </div>
                        {recipe.servingRequirement === 'hot' && (
                            <div className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full inline-block mt-1 capitalize">
                                {recipe.hotPriority} Priority
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
