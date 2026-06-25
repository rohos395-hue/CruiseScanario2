import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";
import HUD from "./HUD3";
import locationsData from "./assets/locations.json";
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

/*** Characters intrerface and types ***/
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

//const characterDb: CharacterDatabase = charactersJson;
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

	//characterDb: CharacterDatabase;
   

    constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
