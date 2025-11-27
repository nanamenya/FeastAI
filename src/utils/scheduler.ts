import type { Recipe, KitchenConfig, Schedule, ScheduledTask, CookingStep } from '../types/types';
import { subMinutes, isBefore } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface DependencyNode {
    step: CookingStep;
    recipeId: string;
    recipeName: string;
    isHot: boolean;
    priority?: string;
    dependencies: string[]; // step IDs
    earliestStart: number; // minutes from start
    earliestFinish: number;
    latestStart: number; // minutes from start
    latestFinish: number;
    duration: number;
}

export function generateSchedule(
    recipes: Recipe[],
    kitchenConfig: KitchenConfig,
    targetTime: Date
): Schedule {
    // 1. Collect all steps and prep blocks
    const allNodes: DependencyNode[] = [];
    const stepIdToNodeMap = new Map<string, DependencyNode>();

    recipes.forEach((recipe) => {
        // Add cooking steps
        recipe.steps.forEach((step) => {
            const node: DependencyNode = {
                step: step,
                recipeId: recipe.id,
                recipeName: recipe.name,
                isHot: recipe.servingRequirement === 'hot',
                priority: recipe.hotPriority,
                dependencies: step.dependsOn || [],
                earliestStart: 0,
                earliestFinish: 0,
                latestStart: 0,
                latestFinish: 0,
                duration: step.duration,
            };

            allNodes.push(node);
            stepIdToNodeMap.set(step.id, node);
        });
    });

    // 2. Build dependency graph & Topological Sort
    // Simple Kahn's algorithm or just DFS since we know structure is DAG (mostly linear per recipe)
    // We'll use a simple level-based approach for earliest start

    // 3. Calculate Earliest Start/Finish (Forward Pass)
    let changed = true;
    while (changed) {
        changed = false;
        allNodes.forEach((node) => {
            let maxDependencyFinish = 0;
            node.dependencies.forEach((depId) => {
                const depNode = stepIdToNodeMap.get(depId);
                if (depNode) {
                    maxDependencyFinish = Math.max(maxDependencyFinish, depNode.earliestFinish);
                }
            });

            if (node.earliestStart !== maxDependencyFinish) {
                node.earliestStart = maxDependencyFinish;
                node.earliestFinish = node.earliestStart + node.duration;
                changed = true;
            }
        });
    }

    // 4. Calculate Latest Start/Finish (Backward Pass)
    // Sink nodes:
    const successors = new Map<string, string[]>();
    allNodes.forEach(node => {
        node.dependencies.forEach(depId => {
            if (!successors.has(depId)) successors.set(depId, []);
            successors.get(depId)?.push(node.step.id);
        });
    });

    const scheduledTasks: ScheduledTask[] = [];

    // "Ready" tasks for backward scheduling: Tasks with no unscheduled successors.
    // Initially, these are the sink nodes.
    const readyQueue = allNodes.filter(node => !successors.has(node.step.id) || successors.get(node.step.id)!.length === 0);

    const getPriorityScore = (node: DependencyNode) => {
        let score = 0;
        if (node.isHot) score += 100;
        if (node.priority === 'high') score += 30;
        if (node.priority === 'medium') score += 20;
        if (node.priority === 'low') score += 10;
        // Tie breaker: longer duration first? or shorter?
        // In bin packing, typically larger items first.
        score += node.duration / 1000;
        return score;
    };

    const SLOT_SIZE = 5; // minutes
    const resourceUsage = new Map<string, Set<number>>(); // ApplianceID -> Set of occupied 5-min slots (0, 1, 2...)
    // Slots are 0-indexed from Target Time backwards.
    // Slot k represents time interval [Target - (k+1)*5, Target - k*5]

    const isResourceAvailable = (applianceType: string, startSlot: number, durationSlots: number, durationMinutes: number): { available: boolean, instanceId: number } => {
        // Prep and rest don't require appliances (unlimited)
        // BUT prep requires a cook. Rest does not.
        if (applianceType === 'rest') return { available: true, instanceId: 0 };

        // Check Cooks Constraint first
        // Active tasks: Stove, Prep, or any task < 10 mins (except rest/passive)
        // Passive tasks: Oven, Slow Cooker, Rice Cooker (if > 10 mins), Rest
        // Let's define "Active" as:
        // 1. Stove (always)
        // 2. Prep (always)
        // 3. BBQ (usually active)
        // 4. Any other task with duration < 10 mins (e.g. microwave 2 mins, airfryer 5 mins)
        // Exclude: Oven > 10, Rice Cooker > 10, Slow Cooker > 10, Rest

        const isAlwaysActive = applianceType === 'stove' || applianceType === 'prep' || applianceType === 'bbq';
        const isShortDuration = durationMinutes < 10;
        const isActiveTask = isAlwaysActive || isShortDuration;

        if (isActiveTask) {
            const cooksCount = kitchenConfig.cooks || 1;
            // Check if a "cook slot" is available
            // We treat "cooks" as a resource named 'cook-1', 'cook-2', etc.
            let cookAvailable = false;
            for (let c = 1; c <= cooksCount; c++) {
                const cookResourceId = `cook-${c}`;
                let free = true;
                for (let s = startSlot; s < startSlot + durationSlots; s++) {
                    if (resourceUsage.get(cookResourceId)?.has(s)) {
                        free = false;
                        break;
                    }
                }
                if (free) {
                    cookAvailable = true;
                    // We don't return here, we just need to know if *at least one* cook is free
                    // We will reserve the cook later if the appliance is also available
                    break;
                }
            }

            if (!cookAvailable) return { available: false, instanceId: -1 };
        }

        // If appliance is prep, and we have a cook (checked above), we are good
        if (applianceType === 'prep') return { available: true, instanceId: 0 };

        const count = applianceType === 'stove' ? kitchenConfig.stoves :
            applianceType === 'oven' ? kitchenConfig.ovens :
                applianceType === 'microwave' ? kitchenConfig.microwaves :
                    applianceType === 'airfryer' ? kitchenConfig.airfryers :
                        applianceType === 'pressurecooker' ? kitchenConfig.pressurecookers :
                            applianceType === 'ricecooker' ? kitchenConfig.ricecookers :
                                applianceType === 'bbq' ? kitchenConfig.bbqs :
                                    applianceType === 'other' ? kitchenConfig.other : 1;

        for (let i = 1; i <= count; i++) {
            const resourceId = `${applianceType}-${i}`;
            let free = true;
            for (let s = startSlot; s < startSlot + durationSlots; s++) {
                if (resourceUsage.get(resourceId)?.has(s)) {
                    free = false;
                    break;
                }
            }
            if (free) return { available: true, instanceId: i };
        }
        return { available: false, instanceId: -1 };
    };

    const reserveResource = (applianceType: string, instanceId: number, startSlot: number, durationSlots: number, durationMinutes: number) => {
        // Reserve appliance
        if (applianceType !== 'prep' && applianceType !== 'rest') {
            const resourceId = `${applianceType}-${instanceId}`;
            if (!resourceUsage.has(resourceId)) resourceUsage.set(resourceId, new Set());
            for (let s = startSlot; s < startSlot + durationSlots; s++) {
                resourceUsage.get(resourceId)?.add(s);
            }
        }

        // Reserve Cook if needed
        const isAlwaysActive = applianceType === 'stove' || applianceType === 'prep' || applianceType === 'bbq';
        const isShortDuration = durationMinutes < 10;
        const isActiveTask = isAlwaysActive || isShortDuration;

        if (isActiveTask && applianceType !== 'rest') {
            const cooksCount = kitchenConfig.cooks || 1;
            for (let c = 1; c <= cooksCount; c++) {
                const cookResourceId = `cook-${c}`;
                if (!resourceUsage.has(cookResourceId)) resourceUsage.set(cookResourceId, new Set());

                let free = true;
                for (let s = startSlot; s < startSlot + durationSlots; s++) {
                    if (resourceUsage.get(cookResourceId)?.has(s)) {
                        free = false;
                        break;
                    }
                }

                if (free) {
                    for (let s = startSlot; s < startSlot + durationSlots; s++) {
                        resourceUsage.get(cookResourceId)?.add(s);
                    }
                    break; // Reserved one cook, done
                }
            }
        }
    };

    const taskSlotAssignments = new Map<string, { minSlot: number, maxSlot: number }>();
    // minSlot: closest to Target (later time)
    // maxSlot: furthest from Target (earlier time)

    const processed = new Set<string>();

    // Helper to check predecessors
    const checkPredecessors = (node: DependencyNode) => {
        node.dependencies.forEach(depId => {
            const depNode = stepIdToNodeMap.get(depId);
            if (depNode && !processed.has(depId)) {
                // Check if all successors of depNode are processed
                const depSuccessors = successors.get(depId) || [];
                if (depSuccessors.every(succId => processed.has(succId))) {
                    // Check if already in queue to avoid dupes
                    if (!readyQueue.find(n => n.step.id === depId)) {
                        readyQueue.push(depNode);
                    }
                }
            }
        });
    };

    while (readyQueue.length > 0) {
        // Sort readyQueue
        readyQueue.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

        const node = readyQueue.shift()!;
        processed.add(node.step.id);

        // Calculate minSlot
        let minSlot = 0;
        const nodeSuccessors = successors.get(node.step.id) || [];
        nodeSuccessors.forEach(succId => {
            const succAssignment = taskSlotAssignments.get(succId);
            if (succAssignment) {
                // Successor occupies [minSlot, maxSlot].
                // We must finish before successor starts.
                // Successor Start Time (slot index) = succAssignment.maxSlot + 1?
                // No.
                // Slot 0: [Target-5, Target]
                // Slot 1: [Target-10, Target-5]
                // Task occupies slots [minSlot, maxSlot].
                // Task Start Time = Target - (maxSlot + 1)*5
                // Task End Time = Target - minSlot*5

                // Constraint: Task End <= Successor Start
                // Target - minSlot*5 <= Target - (succAssignment.maxSlot + 1)*5
                // -minSlot <= -succAssignment.maxSlot - 1
                // minSlot >= succAssignment.maxSlot + 1

                minSlot = Math.max(minSlot, succAssignment.maxSlot + 1);
            }
        });

        const durationSlots = Math.ceil(node.duration / SLOT_SIZE);

        // Find available resource
        let assigned = false;
        let currentSlot = minSlot;

        // Safety break
        while (!assigned && currentSlot < 1000) {
            const { available, instanceId } = isResourceAvailable(node.step.appliance, currentSlot, durationSlots, node.duration);
            if (available) {
                reserveResource(node.step.appliance, instanceId, currentSlot, durationSlots, node.duration);
                taskSlotAssignments.set(node.step.id, { minSlot: currentSlot, maxSlot: currentSlot + durationSlots - 1 });

                // Create ScheduledTask
                const endTime = subMinutes(targetTime, currentSlot * 5);
                const startTime = subMinutes(targetTime, (currentSlot + durationSlots) * 5);

                scheduledTasks.push({
                    stepId: node.step.id,
                    recipeId: node.recipeId,
                    recipeName: node.recipeName,
                    stepName: node.step.name,
                    appliance: node.step.appliance,
                    applianceInstance: instanceId,
                    startTime: startTime,
                    endTime: endTime,
                    duration: node.duration,
                    isHot: node.isHot,
                    priority: node.priority,
                    dependencies: node.dependencies,
                });

                assigned = true;
            } else {
                currentSlot++;
            }
        }

        if (!assigned) {
            console.error("Could not schedule task", node.step.name);
        }

        checkPredecessors(node);
    }

    // Calculate total elapsed time
    let minStartTime = targetTime;
    scheduledTasks.forEach(t => {
        if (isBefore(t.startTime, minStartTime)) minStartTime = t.startTime;
    });

    const totalElapsedTime = (targetTime.getTime() - minStartTime.getTime()) / (1000 * 60);

    return {
        id: uuidv4(),
        targetTime,
        recipes,
        tasks: scheduledTasks,
        totalElapsedTime,
        isValid: true,
        validationErrors: [],
    };
}

export function validateSchedule(schedule: Schedule): string[] {
    const errors: string[] = [];
    // Implement validation logic if needed
    if (!schedule) return errors;
    return errors;
}
