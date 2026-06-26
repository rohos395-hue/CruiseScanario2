export interface Condition {
    type: string;
    operator?: string;
    value?: any;
}
export interface ConditionGroup { 
    all?: (Condition | ConditionGroup)[]; 
    any?: (Condition | ConditionGroup)[]; }

export interface SceneFrame {
    id: string;
    priority:number,
    beforePrompt?: string;
    afterPrompt?: string;
    tones?: string[];
    participants?: string[];
    advanceAfter?: number;
    effects?: any[];
}

export interface Scene {
    id: string;
    priority?: number;
    repeatable?: boolean;
    conditions?: ConditionGroup;
    frames: SceneFrame[];
}
export interface ActiveScene {
    sceneId: string;
    frameIndex: number;
    messagesSeen: number;
}

import scenesData from "./assets/Scenes.json";


export class SceneEngine {

    private scenes;

    constructor() {
        this.scenes = scenesData.scenes;
            }

    getCurrentFrame(state: any) {

        const activeSceneId =
            state.sceneState?.activeSceneId;

        if (!activeSceneId)
            return null;

        const scene =
            this.scenes.find(
                s => s.id === activeSceneId
            );

        if (!scene)
            return null;

        return scene.frames[
            state.sceneState.frameIndex
        ];
    }
startScene(sceneId: string, state: any): boolean {

    const scene =
        this.scenes.find(             s => s.id === sceneId        );

    if (!scene)
        return false;

    state.sceneState = {
        activeSceneId: sceneId,
        frameIndex: 0,
        messagesSeen: 0,
        completedScenes:
            state.sceneState?.completedScenes ?? []
    };

    return true;
}
    getActiveScene(state: any) {

        const activeSceneId =
            state.sceneState?.activeSceneId;

        if (!activeSceneId)
            return null;

        return             this.scenes.find(
                s => s.id === activeSceneId
            );
    }
advanceFrame(state: any): void {

    if (!state.sceneState.activeSceneId)
        return;

    const scene =
        this.getActiveScene(state);

    if (!scene)
        return;

    state.sceneState.frameIndex++;

    if (
        state.sceneState.frameIndex >=
        scene.frames.length
    ) {

        this.completeScene(state);
    }
}
  completeScene(state: any): void {

    if (!state.sceneState.activeSceneId)
        return;

    state.sceneState.completedScenes.add(
        state.sceneState.activeSceneId
    );

    state.sceneState.activeSceneId = null;
}


  
}
