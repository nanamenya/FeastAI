import React from 'react';
import { useStore } from '../store/useStore';
import { User } from 'lucide-react';

export const CookSetup: React.FC = () => {
    const { kitchenConfig, updateKitchenConfig } = useStore();

    const handleChange = (value: number) => {
        updateKitchenConfig({ ...kitchenConfig, cooks: value });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Cook Setup</h2>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                    <span>Number of Cooks</span>
                </div>
                <input
                    type="number"
                    min="1"
                    value={kitchenConfig.cooks}
                    onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
                    className="w-full md:w-32 p-2 md:p-3 border rounded-md text-center text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Future: Assign individual tasks to each cook
                </p>
            </div>
        </div>
    );
};
