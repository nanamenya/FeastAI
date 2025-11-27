import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { CookingStep, Recipe } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

export const RecipeForm: React.FC<{ onClose: () => void; recipe?: Recipe }> = ({ onClose, recipe }) => {
    const { addRecipe, updateRecipe } = useStore();

    const [name, setName] = useState(recipe?.name || '');
    const [servingRequirement, setServingRequirement] = useState<'hot' | 'cold'>(recipe?.servingRequirement || 'hot');
    const [hotPriority, setHotPriority] = useState<'high' | 'medium' | 'low'>(recipe?.hotPriority || 'medium');
    const [steps, setSteps] = useState<CookingStep[]>(recipe?.steps || []);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const addStep = () => {
        const newStep: CookingStep = {
            id: uuidv4(),
            recipeId: '', // Will be set on save
            name: '',
            appliance: 'stove',
            duration: 10,
            dependsOn: [],
        };
        setSteps([...steps, newStep]);
    };

    const updateStep = (id: string, updates: Partial<CookingStep>) => {
        setSteps(steps.map((step) => (step.id === id ? { ...step, ...updates } : step)));
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter((step) => step.id !== id));
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newSteps = [...steps];
        const draggedStep = newSteps[draggedIndex];
        newSteps.splice(draggedIndex, 1);
        newSteps.splice(index, 0, draggedStep);

        setSteps(newSteps);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (recipe) {
            // Edit mode
            const updatedRecipe: Recipe = {
                ...recipe,
                name,
                servingRequirement,
                hotPriority: servingRequirement === 'hot' ? hotPriority : undefined,
                steps: steps.map((step) => ({ ...step, recipeId: recipe.id })),
            };
            updateRecipe(updatedRecipe);
        } else {
            // Create mode
            const recipeId = uuidv4();
            const newRecipe: Recipe = {
                id: recipeId,
                name,
                servingRequirement,
                hotPriority: servingRequirement === 'hot' ? hotPriority : undefined,
                steps: steps.map((step) => ({ ...step, recipeId })),
            };
            addRecipe(newRecipe);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{recipe ? 'Edit Dish' : 'Add New Dish'}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Roast Chicken"
                                />
                            </div>


                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serving Requirement</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={servingRequirement === 'hot'}
                                            onChange={() => setServingRequirement('hot')}
                                            className="text-blue-600"
                                        />
                                        <span>Hot</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={servingRequirement === 'cold'}
                                            onChange={() => setServingRequirement('cold')}
                                            className="text-blue-600"
                                        />
                                        <span>Cold</span>
                                    </label>
                                </div>
                            </div>

                            {servingRequirement === 'hot' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={hotPriority}
                                        onChange={(e) => setHotPriority(e.target.value as any)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="high">High (Must be hot)</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low (Can cool slightly)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Cooking Steps</h3>
                            <button
                                type="button"
                                onClick={addStep}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Step
                            </button>
                        </div>

                        {steps.length === 0 && (
                            <p className="text-gray-500 text-sm italic text-center py-4 bg-gray-50 rounded-lg">
                                No cooking steps added. Add steps for appliance usage.
                            </p>
                        )}

                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`p-4 bg-gray-50 rounded-lg border border-gray-200 relative transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'
                                        }`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeStep(step.id)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pl-6">
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Step Name</label>
                                            <input
                                                type="text"
                                                value={step.name}
                                                onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                                className="w-full p-1.5 border rounded text-sm"
                                                placeholder="e.g. Boil water"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Appliance</label>
                                            <select
                                                value={step.appliance}
                                                onChange={(e) => updateStep(step.id, { appliance: e.target.value as any })}
                                                className="w-full p-1.5 border rounded text-sm"
                                            >
                                                <option value="prep">Prep (No Appliance)</option>
                                                <option value="stove">Stove</option>
                                                <option value="oven">Oven</option>
                                                <option value="microwave">Microwave</option>
                                                <option value="airfryer">Air Fryer</option>
                                                <option value="pressurecooker">Pressure Cooker</option>
                                                <option value="ricecooker">Rice Cooker</option>
                                                <option value="bbq">BBQ/Grill</option>
                                                <option value="other">Other</option>
                                                <option value="rest">Rest (Post-Oven)</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Time (min)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={step.duration}
                                                onChange={(e) => updateStep(step.id, { duration: parseInt(e.target.value) || 0 })}
                                                className="w-full p-1.5 border rounded text-sm"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Depends On</label>
                                            <select
                                                value={step.dependsOn?.[0] || ''}
                                                onChange={(e) => updateStep(step.id, { dependsOn: e.target.value ? [e.target.value] : [] })}
                                                className="w-full p-1.5 border rounded text-sm"
                                            >
                                                <option value="">None</option>
                                                {steps.slice(0, index).map((prevStep) => (
                                                    <option key={prevStep.id} value={prevStep.id}>
                                                        {prevStep.name || 'Unnamed Step'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                            Save Dish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
