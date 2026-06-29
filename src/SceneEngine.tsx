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
    conditions?:ConditionGroup
    beforePrompt?: string;
    afterPrompt?: string;
    tones?: string[];
    participants?: string[];
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

        if (!activeSceneId){
            sceneId = this.findAvailableScene(state);
            if(!sceneid)
                return null;
            started = this.startScene(sceneId, state);
            if (!started)
                return null;
            return sceneState.activeFrame;
        }

        const scene =
            this.scenes.find(
                s => s.id === activeSceneId
            );

        if (!scene)
            return null;
        this.sceneState.messagesScene++;
        newFrame =findAvailableFrame(state);
        if (newFrame.id=== this.sceneState.activeFrame.id) {
            this.sceneState.messagesFrame++;
            return this.sceneState.activeFrame;
        }
        else {
            advanceFrame(state)
            return this.sceneState.activeFrame};

        return this.sceneState.activeFrame;
    }
startScene(sceneId: string, state: any): boolean {

    const scene =
        this.scenes.find(             s => s.id === sceneId        );

    if (!scene)
        return false;

    state.sceneState = {
        activeSceneId: sceneId,
        activeFrame:scene.frames[0],
        frameIndex: 0,
        messagesScene: 0,
        messagesFrame:0,
        completedScenes:
            state.sceneState?.completedScenes ?? [],
        completedFrames:[]
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
advanceFrame(state: any,newFrame:SceneFrame): void {

    

    state.sceneState.completedFrames.add(state.sceneState.activeFrame.id);
    state.sceneState.actveFrame = newFrame;
    state.sceneState.messagesFrame=0;

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
private isConditionGroup(
    obj: any
): obj is ConditionGroup {

    return (
        obj &&
        (
            obj.all !== undefined ||
            obj.any !== undefined
        )
    );
}
   private compare(
    left: any,
    operator: string,
    right: any
): boolean {

    switch(operator) {

        case "===":
            return left === right;

        case "!==":
            return left !== right;

        case ">":
            return left > right;

        case ">=":
            return left >= right;

        case "<":
            return left < right;

        case "<=":
            return left <= right;

        default:
            return false;
    }
   }
    
    private evaluateCondition(
    condition: Condition,
    state: any
): boolean {

    let leftValue: any;

    switch(condition.type) {

        case "at_start":

            leftValue =
                state.day ?? 0;

            break;

        case "scene_time":

            leftValue =
                state.sceneState
                    ?.messagesSeen ?? 0;

            break;

        case "location":

            leftValue =
                state.currentLocation;

            break;

        default:

            return false;
    }

    return this.compare(
        leftValue,
        condition.operator ?? "===",
        condition.value
    );
}

private evaluateConditionGroup(
    group: ConditionGroup,
    state: any
): boolean {

    if (group.all) {

        return group.all.every(
            condition => {

                if (
                    this.isConditionGroup(
                        condition
                    )
                ) {
                    return this
                        .evaluateConditionGroup(
                            condition,
                            state
                        );
                }

                return this
                    .evaluateCondition(
                        condition,
                        state
                    );
            }
        );
    }

    if (group.any) {

        return group.any.some(
            condition => {

                if (
                    this.isConditionGroup(
                        condition
                    )
                ) {
                    return this
                        .evaluateConditionGroup(
                            condition,
                            state
                        );
                }

                return this
                    .evaluateCondition(
                        condition,
                        state
                    );
            }
        );
    }

    return true;
}
    findAvailableScene(state: any): Scene | null {

    const validScenes =
        this.scenes.filter(scene => {

            // Skip completed non-repeatable scenes

            if (
                scene.repeatable === false &&
                state.sceneState.completedScenes.includes(
                    scene.id
                )
            ) {
                return false;
            }

            // No conditions

            if (!scene.conditions) {
                return true;
            }

            return this.evaluateConditionGroup(
                scene.conditions,
                state
            );

        });

    if (validScenes.length === 0) {
        return null;
    }

    validScenes.sort(
        (a, b) =>
            (b.priority ?? 0) -
            (a.priority ?? 0)
    );

    return validScenes[0].id;
    }
    findAvailableFrame(
    state: any
): SceneFrame | null {

    const activeSceneId =
        state.sceneState.activeSceneId;

    if (!activeSceneId) {
        return null;
    }
    

    const scene =
        this.scenes.find(
            s => s.id === activeSceneId
        );

    if (!scene) {
        return null;
    }

    const validFrames =
        scene.frames.filter(frame => {

            if (!frame.conditions) {
                return true;
            }
            if (state.sceneState.completedFrames.includes(frame.id)
                ){ return false}

            return this.evaluateConditionGroup(
                frame.conditions,
                state
            );

        });

    if (validFrames.length === 0) {
        return null;
    }

    validFrames.sort(
        (a, b) =>
            (b.priority ?? 0) -
            (a.priority ?? 0)
    );

    return validFrames[0];
    }
  
}
