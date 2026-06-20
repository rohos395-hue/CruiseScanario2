import React from "react";

import locationsData from "./assets/locations.json";

import CompassIcon from "./assets/compass.jpg";

import MainDeckMap from "./assets/mainDeck.jpg";

interface HUDProps {
    stage: any;
}

export default function HUD({ stage }: HUDProps) {

    const state = stage.myInternalState;

    const currentDeck =
        state.currentDeck || "mainDeck";

    const deckData =
        (locationsData as any)[currentDeck];

    if (!deckData) {
        return <div>Invalid deck: {currentDeck}</div>;
    }


    return (

        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column"
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
                    Current deck: {currentDeck}
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
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",

                        width: "90vw",
                        maxWidth: "900px",

                        backgroundColor: "#111",

                        padding: "10px",

                        zIndex: 9999,

                        border: "2px solid #666"
                    }}
                >

                    <div
                        style={{
                            position: "relative",
                            width: "100%"
                        }}
                    >

                        <img
                            src={MainDeckMap}
                            alt={currentDeck}
                            style={{
                                width: "100%",
                                display: "block"
                            }}
                        />

                        {/* LOCATIONS */}

                        {deckData.locations.map(
                            (loc: any) => (

                                <div
                                    key={loc.name}

                                    onClick={() => {

                                        stage.handleLocationClick(
                                            loc.name
                                        );
                                    }}

                                    title={loc.name}

                                    style={{

                                        position: "absolute",

                                        left:
                                            `${loc.left}%`,

                                        top:
                                            `${loc.top}%`,

                                        width:
                                            `${loc.width}%`,

                                        height:
                                            `${loc.height}%`,

                                        border:
                                            "2px solid red",

                                        backgroundColor:
                                            "rgba(255,0,0,0.15)",

                                        cursor:
                                            "pointer"
                                    }}
                                />

                            )
                        )}

                        {/* FLOOR UP */}

                        <div

                            onClick={() =>
                                stage.changeDeck("up")
                            }

                            title="Go Up"

                            style={{

                                position: "absolute",

                                left:
                                    `${locationsData.ButtonUp.left}%`,

                                top:
                                    `${locationsData.ButtonUp.top}%`,

                                width:
                                    `${locationsData.ButtonUp.width}%`,

                                height:
                                    `${locationsData.ButtonUp.height}%`,

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

                            onClick={() =>
                                stage.changeDeck("down")
                            }

                            title="Go Down"

                            style={{

                                position: "absolute",

                                left:
                                    `${locationsData.ButtonDn.left}%`,

                                top:
                                    `${locationsData.ButtonDn.top}%`,

                                width:
                                    `${locationsData.ButtonDn.width}%`,

                                height:
                                    `${locationsData.ButtonDn.height}%`,

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

                            state.showMap =
                                false;

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
