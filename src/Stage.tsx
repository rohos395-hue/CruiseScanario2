/*** things to do:
0- make input prompt: characters present, characters definition. clothes, role, instruction based on frame tone, instrucion from frame
1-time day increasing
2-judge and modify stats
3- inventory system
4- characters avatar and prompt with html tabs
***/

import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";
import HUD from "./HUD3";
import locationsData from "./assets/locations.json";
import { SceneEngine } from "./SceneEngine";
// import CruiseMap from "./assets/map_cata.jpg";
// import CompassIcon from "./assets/compass.jpg";
/***
 The type that this stage persists message-level state in.
 This is primarily for readability, and not enforced.

 @description This type is saved in the database after each message,
  which makes it ideal for storing things like positions and statuses,
  but not for things like history, which is best managed ephemerally
  in the internal state of the Stage class itself.
 ***/
type MessageStateType = any;



/***
 The type of the stage-specific configuration of this stage.

 @description This is for things you want people to be able to configure,
  like background color.
 ***/
type ConfigType = any;

/***
 The type that this stage persists chat initialization state in.
 If there is any 'constant once initialized' static state unique to a chat,
 like procedurally generated terrain that is only created ONCE and ONLY ONCE per chat,
 it belongs here.
 ***/
type InitStateType = any;

/***
 The type that this stage persists dynamic chat-level state in.
 This is for any state information unique to a chat,
    that applies to ALL branches and paths such as clearing fog-of-war.
 It is usually unlikely you will need this, and if it is used for message-level
    data like player health then it will enter an inconsistent state whenever
    they change branches or jump nodes. Use MessageStateType for that.
 ***/
type ChatStateType = any;

/*** Characters interface and types ***/
export interface Character {
    name: string;
    aspect: string;
    clothings: string;
    role: string;
    secrets: string[];

    fieldToneTraits: Record<string, string>;
}
export interface Stat {
	name:string;
	default: number;
	min: number;
	max: number;
	icon:string;
	description:string;}
export interface CharacterDatabase {
    stats: Stat[];
	characters: Character[];
	
}

import charactersJson from "./assets/characters.json";


/***
 A simple example class that implements the interfaces necessary for a Stage.
 If you want to rename it, be sure to modify App.js as well.
 @link https://github.com/CharHubAI/chub-stages-ts/blob/main/src/types/stage.ts
 ***/

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {

    /***
     A very simple example internal state. Can be anything.
     This is ephemeral in the sense that it isn't persisted to a database,
     but exists as long as the instance does, i.e., the chat page is open.
     ***/
    myInternalState: {[key: string]: any};

	private sceneEngine: SceneEngine;


    constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
        /***
         This is the first thing called in the stage,
         to create an instance of it.
         The definition of InitialData is at @link https://github.com/CharHubAI/chub-stages-ts/blob/main/src/types/initial.ts
         Character at @link https://github.com/CharHubAI/chub-stages-ts/blob/main/src/types/character.ts
         User at @link https://github.com/CharHubAI/chub-stages-ts/blob/main/src/types/user.ts
         ***/
        super(data);

		
		
        const {
			
            characters,         // @type:  { [key: string]: Character }
            users,                  // @type:  { [key: string]: User}
            config,                                 //  @type:  ConfigType
            messageState,                           //  @type:  MessageStateType
            environment,                     // @type: Environment (which is a string)
            initState,                             // @type: null | InitStateType
            chatState                              // @type: null | ChatStateType
        } = data;
		
		
        
		this.myInternalState = messageState != null ? messageState : {'someKey': 'someValue'};
		this.myInternalState.log = "in constructor, data"+ JSON.stringify(chatState, null, 2);
		this.myInternalState.characterDb = charactersJson  as CharacterDatabase;
		const  numCharacters =    this.myInternalState.characterDb.characters.length;
		const statNames = this.myInternalState.characterDb.stats.map((stat: Stat) => stat.name);
		
		const statsByName = Object.fromEntries(    this.myInternalState.characterDb.stats.map( (s:Stat) => [s.name, s]) );
       
        this.myInternalState['numUsers'] = Object.keys(users).length;
		this.myInternalState.numChars =    numCharacters;
		this.myInternalState.characterNames =    this.myInternalState.characterDb.characters.map(        (c:Character) => c.name    );
		this.myInternalState.characterPresent  =    new Array(numCharacters).fill(false);

		this.myInternalState.characterStats = {};
		for (const statName of statNames) {    const stat = statsByName[statName];
    		this.myInternalState.characterStats[statName] = {
        		value: new Array(numCharacters).fill(stat.default),
        		min: stat.min,
        		max: stat.max,
        		icon: stat.icon,
        		description: stat.description               };
										}

        
        this.myInternalState['numMsg'] = 0 ;
        this.myInternalState['day'] = 1;
		this.myInternalState.currentDeck ??= 1;
        this.myInternalState.showMap ??= false;
		this.myInternalState.activeScreen= "none";
		
		
		this.sceneEngine =            new SceneEngine();
		
    }
	
    getGameState() {
    return this.myInternalState;
    }

    moveToLocation(location: string) {

    this.myInternalState.currentLocation = location;

    console.log(
        "[Location]",
        location
    );
    }
	
    async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
        /***
         This is called immediately after the constructor, in case there is some asynchronous code you need to
         run on instantiation.
         ***/
        return {
            /*** @type boolean @default null
             @description The 'success' boolean returned should be false IFF (if and only if), some condition is met that means
              the stage shouldn't be run at all and the iFrame can be closed/removed.
              For example, if a stage displays expressions and no characters have an expression pack,
              there is no reason to run the stage, so it would return false here. ***/
            success: true,
            /*** @type null | string @description an error message to show
             briefly at the top of the screen, if any. ***/
            error: null,
            initState: null,
            chatState: null,
        };
    }

    async setState(state: MessageStateType): Promise<void> {
        /***
         This can be called at any time, typically after a jump to a different place in the chat tree
         or a swipe. Note how neither InitState nor ChatState are given here. They are not for
         state that is affected by swiping.
         ***/
        if (state != null) {
            this.myInternalState = {...this.myInternalState, ...state};
        }
    }

    async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        /***
         This is called after someone presses 'send', but before anything is sent to the LLM.
         ***/
        const {
            content,            /*** @type: string
             @description Just the last message about to be sent. ***/
            anonymizedId,       /*** @type: string
             @description An anonymized ID that is unique to this individual
              in this chat, but NOT their Chub ID. ***/
            isBot             /*** @type: boolean
             @description Whether this is itself from another bot, ex. in a group chat. ***/
        } = userMessage;

		//this.sceneEngine.startScene(    "greeting",    this.myInternalState);
		//this.myInternalState.log=this.myInternalState.log+("after start grretings");
		this.myInternalState.log=this.myInternalState.log+"beforePrompt before getCurrentFrame";

 		const frame =    this.sceneEngine.getCurrentFrame(        this.myInternalState    );
		this.myInternalState.log=this.myInternalState.log+(frame?.beforePrompt);
		let myStageDirections=this.sceneEngine.stageDirectionWrite(this.myInternalState);

          
      return {
            /*** @type null | string @description A string to add to the
             end of the final prompt sent to the LLM,
             but that isn't persisted. ***/
            stageDirections: myStageDirections,
            /*** @type MessageStateType | null @description the new state after the userMessage. ***/
            messageState: {'someKey': this.myInternalState['someKey']},
            /*** @type null | string @description If not null, the user's message itself is replaced
             with this value, both in what's sent to the LLM and in the database. ***/
            modifiedMessage: null,
            /*** @type null | string @description A system message to append to the end of this message.
             This is unique in that it shows up in the chat log and is sent to the LLM in subsequent messages,
             but it's shown as coming from a system user and not any member of the chat. If you have things like
             computed stat blocks that you want to show in the log, but don't want the LLM to start trying to
             mimic/output them, they belong here. ***/
            systemMessage: null,
            /*** @type null | string @description an error message to show
             briefly at the top of the screen, if any. ***/
            error: null,
            chatState: null,
        };
    }

    async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        /***
         This is called immediately after a response from the LLM.
         ***/
        const {
            content,            /*** @type: string
             @description The LLM's response. ***/
            anonymizedId,       /*** @type: string
             @description An anonymized ID that is unique to this individual
              in this chat, but NOT their Chub ID. ***/
            isBot             /*** @type: boolean
             @description Whether this is from a bot, conceivably always true. ***/
        } = botMessage;
        this.myInternalState['numMsg'] = this.myInternalState['numMsg']  +1;
        const currentCount = this.myInternalState['numMsg'] || 0;

        let outMessage = null;
        
    
        return {
            /*** @type null | string @description A string to add to the
             end of the final prompt sent to the LLM,
             but that isn't persisted. ***/
            stageDirections: null,
            /*** @type MessageStateType | null @description the new state after the botMessage. ***/
            messageState: {'someKey': this.myInternalState['someKey']},
            /*** @type null | string @description If not null, the bot's response itself is replaced
             with this value, both in what's sent to the LLM subsequently and in the database. ***/
            modifiedMessage: outMessage, /***null,***/
            /*** @type null | string @description an error message to show
             briefly at the top of the screen, if any. ***/
            error: null,
            systemMessage: null,
            chatState: null
        };
    }


	locationClicked(
    location: string
): void {

    this.myInternalState.currentLocation =
        location;

    //this.closeScreen();

    //this.loadSceneForLocation(location);

	}

	
 render(): ReactElement {

    return  (
        <HUD

            state={this.myInternalState}

            onLocationClick={(location) =>                this.locationClicked( location )            }

        />

    );   
} 


}
