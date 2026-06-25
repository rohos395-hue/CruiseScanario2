import React from "react";
/***
import locationsData from "./assets/locations.json";

interface HUDProps {
    state: any;

    onOpenMap: () => void;
    onOpenStats: () => void;

    onCloseScreen: () => void;

    onChangeDeck: (delta: number) => void;

    onLocationClick: (
        location: string
    ) => void;
}

export default function HUD({

    state,

    onOpenMap,
    onOpenStats,

    onCloseScreen,

    onChangeDeck,

    onLocationClick

}: HUDProps) {

    const currentDeck =
        locationsData.floors[
            state.currentDeck ?? 0
        ];

    return (

        <div>

            

            <div
                style={{
                    backgroundColor: "#222",

                    color: "white",

                    padding: "10px",

                    display: "flex",

                    gap: "10px",

                    alignItems: "center"
                }}
            >

                <button
                    onClick={onOpenMap}
                >
                    🗺 Map
                </button>

                <button
                    onClick={onOpenStats}
                >
                    📊 Stats
                </button>

                <span>
                    📅 Day {state.day}
                </span>

            </div>


            {state.activeScreen === "map" && (

                <div
                    style={{
                        position: "fixed",

                        inset: 0,

                        backgroundColor: "#111",

                        zIndex: 99999,

                        overflow: "auto"
                    }}
                >

                    

                    <button
                        onClick={
                            onCloseScreen
                        }
                        style={{
                            position: "fixed",

                            right: "10px",

                            top: "10px",

                            zIndex: 100000
                        }}
                    >
                        ✕
                    </button>

                    

                    <div
                        style={{
                            textAlign: "center",

                            marginTop: "10px",

                            color: "white"
                        }}
                    >

                        <button
                            onClick={() =>
                                onChangeDeck(-1)
                            }
                        >
                            ◀
                        </button>

                        {" "}

                        {currentDeck.floorname}

                        {" "}

                        <button
                            onClick={() =>
                                onChangeDeck(1)
                            }
                        >
                            ▶
                        </button>

                    </div>

                    

                    <div
                        style={{
                            position: "relative",

                            width: "95vw",

                            margin: "20px auto"
                        }}
                    >

                        <img
                            src={currentDeck.map}

                            alt={
                                currentDeck.floorname
                            }

                            style={{
                                width: "100%",

                                display: "block"
                            }}
                        />

                        

                        {
                            currentDeck.locations.map(
                                (location: any) => (

                                    <div

                                        key={
                                            location.name
                                        }

                                        onClick={() =>
                                            onLocationClick(
                                                location.name
                                            )
                                        }

                                        style={{
                                            position:
                                                "absolute",

                                            left:
                                                `${location.left}%`,

                                            top:
                                                `${location.top}%`,

                                            width:
                                                `${location.width}%`,

                                            height:
                                                `${location.height}%`,

                                            border:
                                                "2px solid red",

                                            backgroundColor:
                                                "rgba(255,0,0,0.15)",

                                            cursor:
                                                "pointer"
                                        }}

                                        title={
                                            location.name
                                        }

                                    />
                                )
                            )
                        }

                    </div>

                </div>

            )}

            

            {state.activeScreen === "stats" && (

                <div
                    style={{
                        position: "fixed",

                        inset: 0,

                        backgroundColor: "#222",

                        color: "white",

                        zIndex: 99999,

                        overflow: "auto"
                    }}
                >

                    <button
                        onClick={
                            onCloseScreen
                        }
                        style={{
                            position: "fixed",

                            top: "10px",

                            right: "10px"
                        }}
                    >
                        ✕
                    </button>

                    <div
                        style={{
                            padding: "20px"
                        }}
                    >

                        <h2>
                            Character Stats
                        </h2>

                        <div>
                            ❤️ Mia:
                            {" "}
                            {state.miaAffection}
                        </div>

                        <div>
                            ❤️ Luna:
                            {" "}
                            {state.lunaAffection}
                        </div>

                        <div>
                            ❤️ Gwen:
                            {" "}
                            {state.gwenAffection}
                        </div>

                        <br />

                        <div>
                            📅 Day:
                            {" "}
                            {state.day}
                        </div>

                        <div>
                            📍 Current Location:
                            {" "}
                            {state.currentLocation}
                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}
***/
