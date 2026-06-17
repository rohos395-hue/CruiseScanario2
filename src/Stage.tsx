import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";
import CruiseMap from "./assets/map_cata.jpg";
import CompassIcon from "./assets/compass.jpg";
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
        this.myInternalState['numUsers'] = Object.keys(users).length;
        this.myInternalState['numChars'] = Object.keys(characters).length;
        this.myInternalState['numMsg'] = 0 ;
        this.myInternalState['miaAffection'] = 25;
        this.myInternalState['lunaAffection'] = 50;
        this.myInternalState['gwenAffection'] = 10;
        this.myInternalState['miaPresent'] = true;
        this.myInternalState['lunaPresent'] = false;
        this.myInternalState['gwenPresent'] = true;
        this.myInternalState['day'] = 1;
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


        let presentCharacters: string[] = [];

    if (this.myInternalState.miaPresent) {
        presentCharacters.push("Mia");
    }

    if (this.myInternalState.lunaPresent) {
        presentCharacters.push("Luna");
    }

    if (this.myInternalState.emmaPresent) {
        presentCharacters.push("Gwen");
    }

    const stageDirections = `
SCENE STATE

Only the following characters are currently present:
${presentCharacters.join(", ")}

Characters who are not present cannot speak, act, appear, be referenced as participating in the scene, or interact with the player.

Write the next response using only characters currently present.
`;
        return {
            /*** @type null | string @description A string to add to the
             end of the final prompt sent to the LLM,
             but that isn't persisted. ***/
            stageDirections: null,
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

         const PROMPT_1 = `*Mia leads the way to the bridge, casting a playful glance back at you as she speaks.*
**Mia:** “Here she is. This is Luna, the Red Cherry’s lead sailor.”

*A stunning blonde woman strides toward you, her figure accentuated by a wet bikini that clings to her curves. She is dripping with seawater, looking refreshed after a dive into the deep emerald ocean.*

**Luna:** “Nice to meet you, Mr. Mills. I hope you’re looking forward to your cruise. The weather is gorgeous, and I suspect we’ll have very pleasant winds for the next few days.”
![image](https://aigc.uploads.dev/image/0a9f120b7d2c34c7d88fe6e8db69436e527fa7eb36fe9f0bd3c6fdef99dd635f.jpeg)`;

        const PROMPT_2 = `*Mia continues the tour, guiding you toward the lobby with a graceful stride.*
**Mia:** “And here is the final member of our crew. Gwen is our esteemed cook and bartender.”

*A gorgeous red-haired woman stands before you, her striking features framed by a cascade of crimson hair. She wears a bikini top that highlights her curves and a pair of breezy linen trousers that hang loosely on her hips.*

**Gwen:** “I am delighted to meet our guest. I hope your cruise is nothing short of wonderful and relaxing. Please, feel free to come to the lobby and ask me for anything—I am always ready for a drink and a chat.”

![image](https://aigc.uploads.dev/image/6e677b68d22c05af4ea4eda185fa868580f88360b351eb0e54992fe911d798b3.jpeg)`;

        const PROMPT_3 = `*Gwen gives you a knowing smile, gesturing toward the table.*

**Gwen:** “I’ve prepared a bottle to welcome you and celebrate the start of your voyage.”

*Gwen reveals a chilled bottle of champagne and four filled glasses, waiting for the celebration to begin.*


![image](https://aigc.uploads.dev/image/ce7f73c20a1577e67d73fee3cff8db97959028e4eb8222218249e3b26530d338.jpeg)

**Mia:** “A toast to Mr. Mills!”
**Gwen:** “Cheers.”
**Luna:** “And to our cruise together. Cheers!”`;

        let outMessage = null;
        if (currentCount === 2) {
           outMessage = PROMPT_1
        }
        else if (currentCount === 3) {
           outMessage = PROMPT_2;
        }
        else if (currentCount === 4) {
           outMessage = PROMPT_3;
        }
        else {
           outMessage = null;
        }
        
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

    render_old(): ReactElement {
        /***
         There should be no "work" done here. Just returning the React element to display.
         If you're unfamiliar with React and prefer video, I've heard good things about
         @link https://scrimba.com/learn/learnreact but haven't personally watched/used it.

         For creating 3D and game components, react-three-fiber
           @link https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
           and the associated ecosystem of libraries are quite good and intuitive.

         Cuberun is a good example of a game built with them.
           @link https://github.com/akarlsten/cuberun (Source)
           @link https://cuberun.adamkarlsten.com/ (Demo)
         ***/
        return <div style={{
            width: '100vw',
            height: '100vh',
            display: 'grid',
            alignItems: 'stretch'
        }}>
            <div>Hello World! I'm an empty stage! With {this.myInternalState['someKey']}!</div>
            <div>There is/are/were {this.myInternalState['numChars']} character(s)
                and {this.myInternalState['numUsers']} human(s) here.
            </div>
        </div>;
    }
    render_old2(): ReactElement {

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>

            {/* Dating Sim HUD */}
            <div style={{
                backgroundColor: '#222',
                color: 'white',
                padding: '8px',
                fontSize: '14px',
                borderBottom: '1px solid #555',
                whiteSpace: 'nowrap'
            }}>
                {this.myInternalState.miaPresent ? "🟢" : "⚫"} ❤️ Mia: {this.myInternalState.miaAffection}
                {"     |    "}
                {this.myInternalState.lunaPresent ? "🟢" : "⚫"} ❤️ Luna: {this.myInternalState.lunaAffection}
                {"    |     "}
                {this.myInternalState.gwenPresent ? "🟢" : "⚫"} ❤️ Gwen: {this.myInternalState.emmaAffection}
                {"        ||        "}
                📅 Day {this.myInternalState.day}
            </div>

            {/* Main stage content */}
            <div style={{
                padding: '10px'
            }}>
                
            </div>

        </div>
    );
}
render(): ReactElement {

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>

            {/* Dating Sim HUD */}
            <div style={{
                backgroundColor: '#222',
                color: 'white',
                padding: '8px',
                fontSize: '14px',
                borderBottom: '1px solid #555',
                whiteSpace: 'nowrap'
            }}>
                {this.myInternalState.miaPresent ? "🟢" : "⚫"} ❤️ Mia: {this.myInternalState.miaAffection}
                {"     |    "}
                {this.myInternalState.lunaPresent ? "🟢" : "⚫"} ❤️ Luna: {this.myInternalState.lunaAffection}
                {"    |     "}
                {this.myInternalState.gwenPresent ? "🟢" : "⚫"} ❤️ Gwen: {this.myInternalState.gwenAffection}
                {"        ||        "}
                📅 Day {this.myInternalState.day}
            </div>
         <button
    style={{
        marginLeft: "20px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0"
    }}
    onClick={() => {

        this.myInternalState.showMap =
            !this.myInternalState.showMap;

        this.forceUpdate();

    }}
>
    <img
        src={CompassIcon}
        alt="Map"
        style={{
            width: "32px",
            height: "32px",
            objectFit: "cover"
        }}
    />
</button>
{showMap && (

    <div style={{

        position: "fixed",

        top: "50%",
        left: "50%",

        transform: "translate(-50%, -50%)",

        backgroundColor: "#111",

        padding: "10px",

        zIndex: 9999
    }}>

        MAP HERE

   
            {/* Main stage content */}
            <div style={{
                padding: '10px',
                position: 'relative'
            }}>

                {/* Cruise Map */}
                <div style={{
                    position: 'relative',
                    width: '800px'
                }}>

                    <img
                        src={CruiseMap}
                        style={{
                            width: '100%',
                            display: 'block'
                        }}
                    />

                    {/* BRIDGE */}
                    <div
                        title="Room1"
                        style={{
                            position: 'absolute',
                            left: '20px',
                            top: '80px',
                            width: '50px',
                            height: '75px',

                            backgroundColor: 'rgba(255,0,0,0.25)',
                            border: '2px solid red',

                            cursor: 'pointer'
                        }}

                        onMouseEnter={() => {
                            console.log("Room1");
                        }}

                        onClick={() => {

                            this.myInternalState.currentLocation = "Room1";

                            this.myInternalState.lunaPresent = true;
                            this.myInternalState.miaPresent = false;
                            this.myInternalState.gwenPresent = false;

                            // this.forceUpdate();
                        }}
                    />

                    {/* MAIN DECK */}
                    <div
                        title="Room2"
                        style={{
                            position: 'absolute',
                            left: '15px',
                            top: '287px',
                            width: '55px',
                            height: '80px',

                            backgroundColor: 'rgba(0,255,0,0.25)',
                            border: '2px solid green',

                            cursor: 'pointer'
                        }}

                        onClick={() => {
                            // this.forceUpdate();
                        }}
                    />

                </div>
                    {/* BRIDGE */}
                    <div
                        title="Room3"
                        style={{
                            position: 'absolute',
                            left: '155px',
                            top: '103px',
                            width: '80px',
                            height: '60px',

                            backgroundColor: 'rgba(255,0,0,0.25)',
                            border: '2px solid red',

                            cursor: 'pointer'
                        }}

                        onMouseEnter={() => {
                            console.log("Room3");
                        }}

                        onClick={() => {

                            this.myInternalState.currentLocation = "Room1";

                            this.myInternalState.lunaPresent = true;
                            this.myInternalState.miaPresent = false;
                            this.myInternalState.gwenPresent = false;

                            // this.forceUpdate();
                        }}
                    />
              {/* Myroom */}
                    <div
                        title="myRoom"
                        style={{
                            position: 'absolute',
                            left: '180px',
                            top: '295px',
                            width: '60px',
                            height: '80px',

                            backgroundColor: 'rgba(0,255,0,0.25)',
                            border: '2px solid green',

                            cursor: 'pointer'
                        }}

                        onClick={() => {
                            // this.forceUpdate();
                        }}
                    />
                {/* Kitchen */}
                    <div
                        title="Kitchen"
                        style={{
                            position: 'absolute',
                            left: '310px',
                            top: '170px',
                            width: '165px',
                            height: '120px',

                            backgroundColor: 'rgba(0,255,0,0.25)',
                            border: '2px solid green',

                            cursor: 'pointer'
                        }}

                        onClick={() => {
                            // this.forceUpdate();
                        }}
                    />
               {/* lobby1 */}
                    <div
                        title="lobby1"
                        style={{
                            position: 'absolute',
                            left: '325px',
                            top: '295px',
                            width: '85px',
                            height: '90px',

                            backgroundColor: 'rgba(0,255,0,0.25)',
                            border: '2px solid green',

                            cursor: 'pointer'
                        }}

                        onClick={() => {
                            // this.forceUpdate();
                        }}
                    />
              {/* hobbyRoom */}
                    <div
                        title="hobbyRoom"
                        style={{
                            position: 'absolute',
                            left: '340px',
                            top: '115px',
                            width: '75px',
                            height: '50px',

                            backgroundColor: 'rgba(0,255,0,0.25)',
                            border: '2px solid green',

                            cursor: 'pointer'
                        }}

                        onClick={() => {
                            // this.forceUpdate();
                        }}
                    />
                           {/* captainRoom */}
                    <div
                        title="captainRoom"
                        style={{
                            position: 'absolute',
                            left: '600px',
                            top: '300px',
                            width: '50px',
                            height: '40px',

                            backgroundColor: 'rgba(0,255,0,0.25)',
                            border: '2px solid green',

                            cursor: 'pointer'
                        }}
                      />


                {/* Debug location display */}
                <div style={{
                    marginTop: '10px',
                    fontWeight: 'bold'
                }}>
                    Current Location: {this.myInternalState.currentLocation}
                </div>

            </div>

        </div>
  </div>

)}
    );
}
}
