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
    participants?: boolean[];
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

    
    stageDirectionWrite(state:any){
   const frame = state.sceneState.activeFrame;     
   let stageDirection ="";     
            //state.log=state.log+"\n inside stageDirectionWrite";
            //state.log=state.log+"\n"+state.characterNames;
            //state.log=state.log+"\n"+frame.participants;
            //state.log=state.log+"\n"+JSON.stringify(frame);
        const presentCharacters = state.characterNames.filter(
  (_:string, index:number) => frame.participants[index]
);

stageDirection += `
Only the following characters are currently present:
${presentCharacters.join(", ")}
Characters who are not present cannot speak, act, appear, be referenced as participating in the scene, or interact with the player.
Write the next response using only characters currently present.
`;
            //state.log=state.log+"\n  "+presentCharacters.join(", ");
        const stageDirectionCharacters = state.characterDb.characters.filter((_ : string, index: number) => presentCharacters[index])
  .map(
    (character:any) => `
Character: ${character.name}
Aspect: ${character.aspect}
Clothings:  ${character.clothing}
Role:  ${character.role}
`
  )
  .join("\n");
            //state.log=state.log+stageDirectionCharacters;
        stageDirection +=stageDirectionCharacters;
        stageDirection +=` describe this scene and elaborate the dialoge of the characters:`;
        stageDirection += frame.beforePrompt;
            return stageDirection;
    }
    newContentAppend(state: any) {
         const frame = state.sceneState.activeFrame; 
        state.log=state.log+"newFrameIdInAppend: "+frame.id;
        if (state.sceneState.messagesFrame ===0){
              return frame.afterPrompt}
        else { return ""}
        //<div style="text-align:center;">
        //<img src="https://example.com/image.jpg" width="400">
        //</div>
    }
    getCurrentFrame(state: any) {

        const activeSceneId =
            state.sceneState?.activeSceneId;
                //state.log=state.log+"\n activeSceneId "+activeSceneId;

        if (!activeSceneId){
                //state.log=state.log+"\n NOT activeSceneId "
            const sceneId = this.findAvailableScene(state);
                //state.log=state.log+"\n sceneId "+sceneId;
            if(!sceneId)
                return null;
            const started = this.startScene(sceneId, state);
            if (!started)
                return null;
            return state.sceneState.activeFrame;
        }

        const scene =
            this.scenes.find(
                s => s.id === activeSceneId
            );

        if (!scene) {
                //state.log=state.log+"\n Not scene row100";
            return null;}

        const allFramesCompleted =
             scene.frames.every(
               frame =>
                  state.sceneState.completedFrames.includes(frame.id)    );

        if (allFramesCompleted) {

           this.completeScene(state);
            return null

          }

                //state.log=state.log+"\n state.sceneState.messagesScene"+state.sceneState.messagesScene;


        
        state.sceneState.messagesScene++;
                //state.log=state.log+"\n state.sceneState.messagesScene"+state.sceneState.messagesScene;
        let newFrame =this.findAvailableFrame(state);
                //state.log=state.log+"\n newFrame "+newFrame?.id
        if(!newFrame)
            return null
        if (newFrame.id=== state.sceneState.activeFrame.id) {
                //state.log=state.log+"\n return same frame"
            state.sceneState.messagesFrame++;
            return state.sceneState.activeFrame;
        }
        else {
                //state.log=state.log+"\n return advance frame"
            this.advanceFrame(state,newFrame);
                              //state.log=state.log+"\n returnED advance frame";
            return state.sceneState.activeFrame};

        return state.sceneState.activeFrame;
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
advanceFrame(state: any,newFrame:any): void {

    
         //state.log=state.log+"\n advancing frame"+newFrame.id;
         //state.log=state.log+"\n frameID"+state.sceneState.activeFrame.id;
    state.sceneState.completedFrames.push(state.sceneState.activeFrame.id);
         //state.log=state.log+"\n completedFrames "+state.sceneState.completedFrames;
    state.sceneState.activeFrame = newFrame;
    state.sceneState.messagesFrame=0;

    
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
                state.sceneState?.messagesScene ?? 0;

            break;

        case "scene_time":

            leftValue =
                state.sceneState
                    ?.messagesScene ?? 0;

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
    findAvailableScene(state: any): string | null {
            //state.log=state.log+"\n in findAvailableScene "+state.sceneState;

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
            //state.log=state.log+"\n in findAvailableFrame "+state.sceneState

    const activeSceneId =
        state.sceneState.activeSceneId;

    if (!activeSceneId) {
        return null;
    }
    

    const scene =
        this.scenes.find(
            s => s.id === activeSceneId
        );

            //state.log=state.log+"\n in findAvailableFrame396 "+JSON.stringify(scene);

    if (!scene) {
        return null;
    }

    const validFrames = scene.frames.filter(frame => {

                //state.log += "\nchecking frame " + frame.id;

        if (state.sceneState.completedFrames.includes(frame.id)) {
                //state.log += "\nframe completed";
            return false;
        }

        if (!frame.conditions) {
                //state.log += "\nframe valid (no conditions)";
            return true;
        }

        const result = this.evaluateConditionGroup(
            frame.conditions,
            state
        );

                //state.log += "\ncondition result=" + result;
                //state.log += "\ncondition condition=" + JSON.stringify(frame.conditions);

        return result;
    });

                //state.log += "\nvalidFrames=" + validFrames.length;

    if (validFrames.length === 0) {
                //state.log += "\nRETURN NULL: no valid frames";
        return null;
    }

    validFrames.sort(
        (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );

        //state.log += "\nRETURN FRAME=" + validFrames[0].id;

    return validFrames[0];
}
  
}
