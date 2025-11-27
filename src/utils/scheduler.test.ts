import { describe, it, expect } from 'vitest';
import { generateSchedule } from './scheduler';
import type { Recipe, KitchenConfig } from '../types/types';

describe('generateSchedule', () => {
    it('should schedule a simple meal', () => {
        const recipes: Recipe[] = [
            {
                id: 'r1',
                name: 'Pasta',
                servingRequirement: 'hot',
                hotPriority: 'high',
                steps: [
                    {
                        id: 's1',
                        recipeId: 'r1',
                        name: 'Boil Water',
                        appliance: 'stove',
                        duration: 15,
                        dependsOn: [],
                    },
                ],
            },
        ];

        const config: KitchenConfig = {
            stoves: 4,
            ovens: 1,
            microwaves: 1,
            airfryers: 0,
            pressurecookers: 0,
            ricecookers: 0,
            bbqs: 0,
            other: 0,
            cooks: 2
        };

        const targetTime = new Date('2023-11-23T18:00:00');
        const schedule = generateSchedule(recipes, config, targetTime);

        expect(schedule.tasks).toHaveLength(2); // Prep + Boil
        // Prep should be before Boil
        const prep = schedule.tasks.find((t) => t.stepName.includes('Prep'));
        const boil = schedule.tasks.find((t) => t.stepName === 'Boil Water');

        expect(prep).toBeDefined();
        expect(boil).toBeDefined();
        expect(prep!.endTime.getTime()).toBeLessThanOrEqual(boil!.startTime.getTime());

        // Boil should end at target time (hot dish)
        expect(boil!.endTime.getTime()).toBe(targetTime.getTime());
    });
});
