import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe, KitchenConfig, Schedule } from '../types/types';

interface AppState {
    recipes: Recipe[];
    kitchenConfig: KitchenConfig;
    currentSchedule: Schedule | null;

    // Actions
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    updateKitchenConfig: (config: KitchenConfig) => void;
    setSchedule: (schedule: Schedule | null) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            recipes: [],
            kitchenConfig: {
                stoves: 4,
                ovens: 1,
                microwaves: 1,
                airfryers: 0,
                pressurecookers: 0,
                ricecookers: 0,
                bbqs: 0,
                other: 0,
                cooks: 1,
            },
            currentSchedule: null,

            addRecipe: (recipe) =>
                set((state) => ({ recipes: [...state.recipes, recipe] })),

            updateRecipe: (updatedRecipe) =>
                set((state) => ({
                    recipes: state.recipes.map((r) =>
                        r.id === updatedRecipe.id ? updatedRecipe : r
                    ),
                })),

            deleteRecipe: (id) =>
                set((state) => ({
                    recipes: state.recipes.filter((r) => r.id !== id),
                })),

            updateKitchenConfig: (config) =>
                set(() => ({ kitchenConfig: config })),

            setSchedule: (schedule) =>
                set(() => ({ currentSchedule: schedule })),
        }),
        {
            name: 'feast-ai-storage',
        }
    )
);
