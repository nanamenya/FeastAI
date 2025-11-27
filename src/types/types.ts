export interface CookingStep {
    id: string;
    recipeId: string;
    name: string;
    appliance: 'prep' | 'stove' | 'oven' | 'microwave' | 'rest' | 'airfryer' | 'pressurecooker' | 'ricecooker' | 'bbq' | 'other';
    duration: number; // minutes
    temperature?: number;
    temperatureUnit?: 'F' | 'C';
    dependsOn?: string[]; // array of step IDs that must complete first
}

export interface Recipe {
    id: string;
    name: string;
    url?: string;
    servingRequirement: 'hot' | 'cold';
    hotPriority?: 'high' | 'medium' | 'low'; // required if hot
    steps: CookingStep[];
}

export interface KitchenConfig {
    stoves: number;
    ovens: number;
    microwaves: number;
    airfryers: number;
    pressurecookers: number;
    ricecookers: number;
    bbqs: number;
    other: number;
    cooks: number;
}

export interface ScheduledTask {
    stepId: string;
    recipeId: string;
    recipeName: string;
    stepName: string;
    appliance: string;
    applianceInstance: number; // which specific burner/oven
    startTime: Date;
    endTime: Date;
    duration: number;
    isHot: boolean;
    priority?: string;
    dependencies: string[];
}

export interface Schedule {
    id: string;
    targetTime: Date;
    recipes: Recipe[];
    tasks: ScheduledTask[];
    totalElapsedTime: number; // minutes
    isValid: boolean;
    validationErrors?: string[];
}
