import React from 'react';
import { useStore } from '../store/useStore';
import { format, differenceInMinutes } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { ShareButton } from './ShareButton';

export const ScheduleGrid: React.FC = () => {
    const { currentSchedule } = useStore();

    if (!currentSchedule) return null;

    const { tasks: rawTasks, targetTime: rawTargetTime, totalElapsedTime } = currentSchedule;

    // Hydration fix: Ensure dates are Date objects (LocalStorage stores them as strings)
    const targetTime = new Date(rawTargetTime);
    const tasks = rawTasks.map(t => ({
        ...t,
        startTime: new Date(t.startTime),
        endTime: new Date(t.endTime)
    }));

    // Determine grid range
    // Start time = earliest task start time
    // End time = target time (or latest task end time if validation fails)

    let startTime = new Date(targetTime);
    let endTime = new Date(targetTime);

    tasks.forEach(t => {
        if (t.startTime < startTime) startTime = new Date(t.startTime);
        if (t.endTime > endTime) endTime = new Date(t.endTime);
    });

    startTime = new Date(startTime.getTime() - 5 * 60000); // -5 mins
    endTime = new Date(endTime.getTime() + 5 * 60000); // +5 mins for padding

    const pxPerMinute = 4;

    // Generate unique color mapping for each recipe
    const recipeColors = new Map<string, string>();
    const availableColors = [
        'bg-rose-300 border-rose-400 text-rose-900',
        'bg-sky-300 border-sky-400 text-sky-900',
        'bg-emerald-300 border-emerald-400 text-emerald-900',
        'bg-amber-300 border-amber-400 text-amber-900',
        'bg-violet-300 border-violet-400 text-violet-900',
        'bg-fuchsia-300 border-fuchsia-400 text-fuchsia-900',
        'bg-teal-300 border-teal-400 text-teal-900',
        'bg-orange-300 border-orange-400 text-orange-900',
        'bg-indigo-300 border-indigo-400 text-indigo-900',
        'bg-lime-300 border-lime-400 text-lime-900',
        'bg-cyan-300 border-cyan-400 text-cyan-900',
        'bg-pink-300 border-pink-400 text-pink-900',
    ];

    currentSchedule.recipes.forEach((recipe, index) => {
        recipeColors.set(recipe.id, availableColors[index % availableColors.length]);
    });

    // Build resources list from tasks that are actually scheduled
    const resourcesMap = new Map<string, { id: string; label: string; type: string; order: number }>();

    tasks.forEach(task => {
        const resourceId = task.appliance === 'prep' || task.appliance === 'rest'
            ? `${task.appliance}-0`
            : `${task.appliance}-${task.applianceInstance}`;

        if (!resourcesMap.has(resourceId)) {
            let label = '';
            let order = 100; // Default order for other appliances

            if (task.appliance === 'prep') { label = 'Prep'; order = 0; }
            else if (task.appliance === 'rest') { label = 'Rest'; order = 1; }
            else if (task.appliance === 'stove') { label = `Stove ${task.applianceInstance}`; order = 10 + task.applianceInstance; }
            else if (task.appliance === 'oven') { label = `Oven ${task.applianceInstance}`; order = 20 + task.applianceInstance; }
            else if (task.appliance === 'microwave') { label = `Microwave ${task.applianceInstance}`; order = 30 + task.applianceInstance; }
            else if (task.appliance === 'airfryer') { label = `Air Fryer ${task.applianceInstance}`; order = 40 + task.applianceInstance; }
            else if (task.appliance === 'pressurecooker') { label = `Pressure Cooker ${task.applianceInstance}`; order = 50 + task.applianceInstance; }
            else if (task.appliance === 'ricecooker') { label = `Rice Cooker ${task.applianceInstance}`; order = 60 + task.applianceInstance; }
            else if (task.appliance === 'bbq') { label = `BBQ ${task.applianceInstance}`; order = 70 + task.applianceInstance; }
            else if (task.appliance === 'other') { label = `Other ${task.applianceInstance}`; order = 80 + task.applianceInstance; }

            resourcesMap.set(resourceId, { id: resourceId, label, type: task.appliance, order });
        }
    });

    const resources = Array.from(resourcesMap.values()).sort((a, b) => a.order - b.order);

    const timeMarkers: Date[] = [];
    const markerInterval = 15;
    const startMinute = Math.floor(startTime.getMinutes() / markerInterval) * markerInterval;
    const firstMarkerTime = new Date(startTime);
    firstMarkerTime.setMinutes(startMinute, 0, 0);

    let currentTime = new Date(firstMarkerTime);
    while (currentTime <= endTime) {
        timeMarkers.push(new Date(currentTime));
        currentTime = new Date(currentTime.getTime() + markerInterval * 60000);
    }

    return (
        <>
            {/* 4. Cooking Schedule */}
            <section className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Cooking Schedule</h2>
                    <div className="text-sm md:text-base text-gray-600">
                        Total Time: <span className="font-bold">{Math.round(totalElapsedTime)} min</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
                    <span className="text-sm font-semibold text-gray-700 mr-2">Legend:</span>
                    {currentSchedule.recipes.map((recipe) => {
                        const color = recipeColors.get(recipe.id) || availableColors[0];
                        return (
                            <div key={recipe.id} className={twMerge("px-3 py-1 rounded border text-xs font-medium", color)}>
                                {recipe.name}
                            </div>
                        );
                    })}
                </div>

                {/* Grid Container */}
                <div className="relative overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0" data-schedule-grid>
                    <div className="min-w-[1000px] md:min-w-[1200px]">
                        {/* Time Header */}
                        <div className="flex border-b h-8 relative mb-2">
                            <div className="w-32 flex-shrink-0"></div> {/* Spacer for labels */}
                            <div className="flex-1 relative h-full">
                                {timeMarkers.map((time, i) => {
                                    const left = (differenceInMinutes(time, startTime) * pxPerMinute);
                                    if (left < 0) return null;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute text-xs text-gray-400 transform -translate-x-1/2"
                                            style={{ left: `${left}px` }}
                                        >
                                            {format(time, 'h:mm a')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grid Body & Arrows Calculation */}
                        {(() => {
                            // Pre-calculate layout
                            const rowLayouts = new Map<string, { top: number; height: number; taskLanes: Map<string, number> }>();
                            let currentTop = 0;

                            resources.forEach(resource => {
                                const resourceTasks = tasks.filter(t =>
                                    (t.appliance === 'prep' && resource.type === 'prep') ||
                                    (t.appliance === 'rest' && resource.type === 'rest') ||
                                    (t.appliance === resource.type && t.applianceInstance === parseInt(resource.id.split('-')[1]))
                                );

                                resourceTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

                                const lanes: { endTime: number }[] = [];
                                const taskLanes = new Map<string, number>();

                                resourceTasks.forEach(task => {
                                    let laneIndex = -1;
                                    for (let i = 0; i < lanes.length; i++) {
                                        if (lanes[i].endTime <= task.startTime.getTime()) {
                                            laneIndex = i;
                                            break;
                                        }
                                    }
                                    if (laneIndex === -1) {
                                        laneIndex = lanes.length;
                                        lanes.push({ endTime: 0 });
                                    }

                                    lanes[laneIndex].endTime = task.endTime.getTime();
                                    taskLanes.set(task.stepId, laneIndex);
                                });

                                const rowHeight = Math.max(48, lanes.length * 32 + 16);
                                rowLayouts.set(resource.id, { top: currentTop, height: rowHeight, taskLanes });
                                currentTop += rowHeight;
                            });

                            return (
                                <div className="relative">
                                    {/* Rows */}
                                    <div className="space-y-0"> {/* Removed space-y-2 to manage exact positioning if needed, but let's keep flow for now and just use heights */}
                                        {resources.map((resource) => {
                                            const layout = rowLayouts.get(resource.id)!;
                                            const resourceTasks = tasks.filter(t =>
                                                (t.appliance === 'prep' && resource.type === 'prep') ||
                                                (t.appliance === 'rest' && resource.type === 'rest') ||
                                                (t.appliance === resource.type && t.applianceInstance === parseInt(resource.id.split('-')[1]))
                                            );

                                            return (
                                                <div key={resource.id} className="flex items-center relative group hover:bg-gray-50 rounded border-b border-gray-100 last:border-0" style={{ height: `${layout.height}px` }}>
                                                    <div className="w-32 flex-shrink-0 text-sm font-medium text-gray-600 pl-2">
                                                        {resource.label}
                                                    </div>

                                                    <div className="flex-1 relative h-full border-l border-gray-100 bg-gray-50/50">
                                                        {/* Grid lines */}
                                                        {timeMarkers.map((time, i) => {
                                                            const left = (differenceInMinutes(time, startTime) * pxPerMinute);
                                                            if (left < 0) return null;
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="absolute top-0 bottom-0 border-r border-gray-200 border-dashed opacity-50"
                                                                    style={{ left: `${left}px` }}
                                                                />
                                                            );
                                                        })}

                                                        {/* Tasks */}
                                                        {resourceTasks.map((task) => {
                                                            const left = differenceInMinutes(task.startTime, startTime) * pxPerMinute;
                                                            const width = task.duration * pxPerMinute;
                                                            const laneIndex = layout.taskLanes.get(task.stepId) || 0;
                                                            const top = 4 + laneIndex * 30;

                                                            const color = recipeColors.get(task.recipeId) || availableColors[0];

                                                            return (
                                                                <div
                                                                    key={task.stepId}
                                                                    className={twMerge(
                                                                        "absolute rounded border text-xs px-2 py-1 shadow-sm transition-all hover:shadow-md hover:z-10 cursor-pointer font-medium overflow-hidden",
                                                                        color
                                                                    )}
                                                                    style={{
                                                                        left: `${left}px`,
                                                                        width: `${width}px`,
                                                                        top: `${top}px`,
                                                                        minHeight: '24px',
                                                                        lineHeight: '1.2',
                                                                        wordBreak: 'break-word',
                                                                        whiteSpace: 'normal'
                                                                    }}
                                                                    title={`${task.recipeName}: ${task.stepName} (${task.duration} min)`}
                                                                    data-task-id={task.stepId}
                                                                >
                                                                    {task.recipeName}: {task.stepName}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Dependency Arrows */}
                                    <svg className="absolute top-0 left-32 right-0 bottom-0 pointer-events-none" style={{ zIndex: 15, height: `${currentTop}px` }}>
                                        <defs>
                                            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                                <polygon points="0 0, 10 3, 0 6" fill="black" opacity="0.4" />
                                            </marker>
                                        </defs>
                                        {tasks.map(task => {
                                            return (task.dependencies || []).map((depId, idx) => {
                                                const depTask = tasks.find(t => t.stepId === depId);
                                                if (!depTask) return null;

                                                const depEndX = differenceInMinutes(depTask.endTime, startTime) * pxPerMinute;
                                                const taskStartX = differenceInMinutes(task.startTime, startTime) * pxPerMinute;

                                                // Find resources
                                                const depResource = resources.find(r =>
                                                    (depTask.appliance === 'prep' && r.type === 'prep') ||
                                                    (depTask.appliance === 'rest' && r.type === 'rest') ||
                                                    (depTask.appliance === r.type && depTask.applianceInstance === parseInt(r.id.split('-')[1]))
                                                );
                                                const taskResource = resources.find(r =>
                                                    (task.appliance === 'prep' && r.type === 'prep') ||
                                                    (task.appliance === 'rest' && r.type === 'rest') ||
                                                    (task.appliance === r.type && task.applianceInstance === parseInt(r.id.split('-')[1]))
                                                );

                                                if (!depResource || !taskResource) return null;

                                                const depLayout = rowLayouts.get(depResource.id);
                                                const taskLayout = rowLayouts.get(taskResource.id);

                                                if (!depLayout || !taskLayout) return null;

                                                // Calculate Y positions
                                                // Center of the task block
                                                const depLane = depLayout.taskLanes.get(depTask.stepId) || 0;
                                                const taskLane = taskLayout.taskLanes.get(task.stepId) || 0;

                                                const depY = depLayout.top + 4 + depLane * 30 + 12; // +12 for half height of 24px block
                                                const taskY = taskLayout.top + 4 + taskLane * 30 + 12;

                                                return (
                                                    <line
                                                        key={`${task.stepId}-${depId}-${idx}`}
                                                        x1={depEndX}
                                                        y1={depY}
                                                        x2={taskStartX}
                                                        y2={taskY}
                                                        stroke="black"
                                                        strokeWidth="1"
                                                        markerEnd="url(#arrowhead)"
                                                        opacity="0.4"
                                                    />
                                                );
                                            });
                                        })}
                                    </svg>
                                </div>
                            );
                        })()}

                        {/* Target Time Line - Checkered Finish Line */}
                        <div
                            className="absolute top-8 bottom-0 z-20 pointer-events-none"
                            style={{
                                left: `${(differenceInMinutes(targetTime, startTime) * pxPerMinute) + 128}px`,
                                width: '24px',
                            }}
                        >
                            {/* Create 4 columns of checkerboard pattern */}
                            <div className="absolute inset-0 flex">
                                {[0, 1, 2, 3].map(col => (
                                    <div key={col} className="flex-1" style={{
                                        background: `repeating-linear-gradient(0deg, ${col % 2 === 0 ? '#000' : '#fff'} 0px, ${col % 2 === 0 ? '#000' : '#fff'} 12px, ${col % 2 === 0 ? '#fff' : '#000'} 12px, ${col % 2 === 0 ? '#fff' : '#000'} 24px)`,
                                        border: '0.5px solid #666'
                                    }} />
                                ))}
                            </div>
                            <div className="absolute -top-6 -right-2 bg-black text-white text-xs px-2 py-1 rounded font-bold whitespace-nowrap">🏁 Target</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Dish Summary */}
            <section className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Dish Summary</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 text-sm md:text-base">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-200 px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold">Dish</th>
                                <th className="border border-gray-200 px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold">Start</th>
                                <th className="border border-gray-200 px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold">Complete</th>
                                <th className="border border-gray-200 px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSchedule.recipes.map(recipe => {
                                const recipeTasks = tasks.filter(t => t.recipeId === recipe.id);
                                if (recipeTasks.length === 0) return null;

                                const recipeStartTime = new Date(Math.min(...recipeTasks.map(t => t.startTime.getTime())));
                                const recipeEndTime = new Date(Math.max(...recipeTasks.map(t => t.endTime.getTime())));
                                const totalMinutes = differenceInMinutes(recipeEndTime, recipeStartTime);

                                return (
                                    <tr key={recipe.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-200 px-3 md:px-4 py-2 font-medium text-xs md:text-sm">{recipe.name}</td>
                                        <td className="border border-gray-200 px-3 md:px-4 py-2 text-xs md:text-sm">{format(recipeStartTime, 'h:mm a')}</td>
                                        <td className="border border-gray-200 px-3 md:px-4 py-2 text-xs md:text-sm">{format(recipeEndTime, 'h:mm a')}</td>
                                        <td className="border border-gray-200 px-3 md:px-4 py-2 text-xs md:text-sm">{totalMinutes} min</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 6. Share Button */}
            <section className="no-print">
                <ShareButton />
            </section>
        </>
    );
};
