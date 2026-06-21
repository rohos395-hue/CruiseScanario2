import React from "react";
import locationsData from "./assets/locations.json";
import CompassIcon from "./assets/compass.jpg";

interface HUDProps {
    stage: any;
}

export default function HUD({ stage }: HUDProps) {

    const state = stage.myInternalState;

    const deckIndex =    state.currentDeck ?? 1;

    const deckData =     locationsData.floors[deckIndex];


    return (

        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                overflowX: "hidden",
                overflowY: "auto"
            }}
        >

            {/* HUD BAR */}

            <div
                style={{
                    backgroundColor: "#222",
                    color: "white",
                    padding: "8px",
                    fontSize: "14px",
                    borderBottom: "1px solid #555",
                    whiteSpace: "nowrap"
                }}
            >

                <button
                    style={{
                        marginRight: "10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer"
                    }}
                    onClick={() => {

                        state.showMap =
                            !state.showMap;

                        // @ts-ignore
                        stage.forceUpdate?.();
                    }}
                >
                    <img
                        src={CompassIcon}
                        alt="Map"
                        style={{
                            width: "32px",
                            height: "32px"
                        }}
                    />
                </button>

                {state.miaPresent ? "🟢" : "⚫"} ❤️ Mia: {state.miaAffection}

                {" | "}

                {state.lunaPresent ? "🟢" : "⚫"} ❤️ Luna: {state.lunaAffection}

                {" | "}

                {state.gwenPresent ? "🟢" : "⚫"} ❤️ Gwen: {state.gwenAffection}

                {" || "}

                📅 Day {state.day}

                <div style={{color:"white"}}>
                    
                    Current deck: {deckData.floorname}
                </div>

                <div style={{color:"white"}}>
                    Map path: {deckData.map}
                </div>    

            </div>

            {/* MAP */}

            {state.showMap && (

<div
    style={{
        position: "fixed",

        top: "2%",
        left: "2%",

        width: "50vw",
        maxHeight: "50vh",
        
        overflow: "auto",
        backgroundColor: "#111",

        border: "2px solid #666",

        padding: "5px",

        zIndex: 9999
    }}
>

    <div
        style={{
            position: "relative",
            height: "100%"
        }}
    >

        <img
    src={deckData.map}
    alt={deckData.floorname}
    style={{
        width: "100%",
        height: "auto",
        display: "block"
    }}
        />

        {deckData.locations.map(
            (loc: any) => (

                <div
                    key={loc.name}

                    title={loc.name}

                    onClick={() =>
                        stage.handleLocationClick(
                            loc.name
                        )
                    }

                    style={{
                        position: "absolute",

                        left:                            `${loc.left}%`,

                        top:                            `${loc.top}%`,

                        width:                            `${loc.width}%`,

                        height:                            `${loc.height}%`,

                        border:                            "2px solid red",

                        backgroundColor:                            "rgba(255,0,0,0.15)",

                        cursor:                            "pointer"
                    }}
                />
            )
        )}

        {/* FLOOR UP */}

        <div
            title="Go Up"

            onClick={() =>
                stage.changeDeck("up")
            }

            style={{
                position: "absolute",

                left: "90%",top:"10%",width:"5%",height:"5%",

                border:
                    "2px solid blue",

                backgroundColor:
                    "rgba(0,0,255,0.15)",

                cursor:
                    "pointer"
            }}
        />

        {/* FLOOR DOWN */}

        <div
            title="Go Down"

            onClick={() =>
                stage.changeDeck("down")
            }

            style={{
                position: "absolute",

                 left: "10%",top:"10%",width:"5%",height:"5%",

                border:
                    "2px solid green",

                backgroundColor:
                    "rgba(0,255,0,0.15)",

                cursor:
                    "pointer"
            }}
        />

    </div>

    <button
        style={{
            marginTop: "10px"
        }}

        onClick={() => {

            state.showMap = false;

            // @ts-ignore
            stage.forceUpdate?.();
        }}
    >
        Close Map
    </button>

</div>

)}

        </div>
    );
}
