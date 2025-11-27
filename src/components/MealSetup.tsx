import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { generateSchedule } from '../utils/scheduler';
import { Play, Calendar } from 'lucide-react';

export const MealSetup: React.FC = () => {
    const { recipes, kitchenConfig, setSchedule } = useStore();
    const [targetTime, setTargetTime] = useState('18:00');

    const handleGenerate = () => {
        if (recipes.length === 0) return;

        // Parse target time
        const [hours, minutes] = targetTime.split(':').map(Number);
        const targetDate = new Date();
        targetDate.setHours(hours, minutes, 0, 0);

        // If target time is in the past, assume tomorrow? Or just today (could be past)
        // For planning, usually future.
        if (targetDate.getTime() < Date.now()) {
            // targetDate.setDate(targetDate.getDate() + 1); // Optional: default to tomorrow
        }

        const schedule = generateSchedule(recipes, kitchenConfig, targetDate);
        setSchedule(schedule);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Serving Time</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
                        <input
                            type="time"
                            value={targetTime}
                            onChange={(e) => setTargetTime(e.target.value)}
                            className="w-full pl-10 p-3 md:p-3 border rounded-md text-base"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={recipes.length === 0}
                    className="sm:mt-auto px-6 py-3 md:py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="whitespace-nowrap">Generate Schedule</span>
                </button>
            </div>

            {recipes.length === 0 && (
                <p className="text-sm text-red-500">Add at least one dish to generate a schedule.</p>
            )}
        </div>
    );
};
