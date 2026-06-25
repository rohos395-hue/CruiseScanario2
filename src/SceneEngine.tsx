export interface Condition {
    type: string;
    operator?: string;
    value?: any;
}

export interface SceneFrame {
    id: string;
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
    trigger?: any;
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
startScene(sceneId: string): boolean {

    const scene =
        this.scenes.find(
            s => s.id === sceneId
        );

    if (!scene)
        return false;

    this.activeScene = {

        sceneId,

        frameIndex: 0,

        messagesSeen: 0
    };

    return true;
}
advanceFrame(): void {

    if (!this.activeScene)
        return;

    const scene =
        this.getActiveScene();

    if (!scene)
        return;

    this.activeScene.frameIndex++;

    if (
        this.activeScene.frameIndex >=
        scene.frames.length
    ) {

        this.completeScene();
    }
}
  completeScene(): void {

    if (!this.activeScene)
        return;

    this.completedScenes.add(
        this.activeScene.sceneId
    );

    this.activeScene = null;
}


  
}
