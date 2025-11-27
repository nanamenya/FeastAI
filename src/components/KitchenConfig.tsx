import React from 'react';
import { useStore } from '../store/useStore';
import { Flame, Microwave, Disc, Wind, Droplet, Zap, Beef, CircleDot, User } from 'lucide-react';

export const KitchenConfig: React.FC = () => {
    const { kitchenConfig, updateKitchenConfig } = useStore();

    const handleChange = (key: keyof typeof kitchenConfig, value: number) => {
        updateKitchenConfig({
            ...kitchenConfig,
            [key]: Math.max(0, value),
        });
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    <span>Stoves</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.stoves}
                    onChange={(e) => handleChange('stoves', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Disc className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    <span>Ovens</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.ovens}
                    onChange={(e) => handleChange('ovens', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Microwave className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                    <span>Microwaves</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.microwaves}
                    onChange={(e) => handleChange('microwaves', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Wind className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" />
                    <span>Air Fryers</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.airfryers}
                    onChange={(e) => handleChange('airfryers', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Droplet className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                    <span className="text-xs md:text-sm lg:text-base">Pressure Cookers</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.pressurecookers}
                    onChange={(e) => handleChange('pressurecookers', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                    <span>Rice Cookers</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.ricecookers}
                    onChange={(e) => handleChange('ricecookers', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <Beef className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                    <span>BBQ/Grills</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.bbqs}
                    onChange={(e) => handleChange('bbqs', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <CircleDot className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <span>Other</span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={kitchenConfig.other}
                    onChange={(e) => handleChange('other', parseInt(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    <span>Cooks</span>
                </div>
                <input
                    type="number"
                    min="1"
                    value={kitchenConfig.cooks}
                    onChange={(e) => handleChange('cooks', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2 md:p-3 border rounded-md text-center text-base"
                />
            </div>
        </div>
    );
};
