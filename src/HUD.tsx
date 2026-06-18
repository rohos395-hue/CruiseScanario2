import React, { useState } from "react";

import CruiseMap from "./assets/map_cata.jpg";
import CompassIcon from "./assets/compass.jpg";

interface HUDProps {
    stage: any;
}

export default function HUD({ stage }: HUDProps) {

    const [showMap, setShowMap] = useState(false);

    const state = stage.getGameState();

    const locations = [
        { title: 'Room1',       left: '20px',  top: '80px',  width: '50px',  height: '75px' },
        { title: 'Room2',       left: '15px',  top: '287px', width: '55px',  height: '80px' },
        { title: 'Room3',       left: '155px', top: '103px', width: '80px',  height: '60px' },
        { title: 'myRoom',      left: '180px', top: '295px', width: '60px',  height: '80px' },
        { title: 'Kitchen',     left: '310px', top: '170px', width: '165px', height: '120px' },
        { title: 'lobby1',      left: '325px', top: '295px', width: '85px',  height: '90px' },
        { title: 'hobbyRoom',   left: '340px', top: '115px', width: '75px',  height: '50px' },
        { title: 'captainRoom', left: '600px', top: '300px', width: '50px',  height: '40px' }
    ];

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
                        marginLeft: "20px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        verticalAlign: "middle"
                    }}
                    onClick={() => setShowMap(true)}
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

                {"  "}

                {state.miaPresent ? "🟢" : "⚫"} ❤️ Mia: {state.miaAffection}

                {" | "}

                {state.lunaPresent ? "🟢" : "⚫"} ❤️ Luna: {state.lunaAffection}

                {" | "}

                {state.gwenPresent ? "🟢" : "⚫"} ❤️ Gwen: {state.gwenAffection}

                {" || "}

                📅 Day {state.day}

            </div>

            {/* MAP POPUP */}

            {showMap && (

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
                        border: "2px solid #666",
                        zIndex: 9999
                    }}
                >

                    <div
                        style={{
                            position: "relative",
                            width: "100%"
                        }}
                    >

                        <img
                            src={CruiseMap}
                            style={{
                                width: "100%",
                                display: "block"
                            }}
                        />

                        {locations.map((loc) => (

                            <div
                                key={loc.title}
                                onClick={() => {

                                    stage.moveToLocation(
                                        loc.title
                                    );

                                    setShowMap(false);

                                }}
                                style={{
                                    position: "absolute",
                                    left: loc.left,
                                    top: loc.top,
                                    width: loc.width,
                                    height: loc.height,

                                    border: "2px solid rgba(255,0,0,0.5)",

                                    cursor: "pointer"
                                }}
                            />

                        ))}

                    </div>

                    <button
                        style={{
                            marginTop: "10px"
                        }}
                        onClick={() => setShowMap(false)}
                    >
                        Close Map
                    </button>

                </div>

            )}

            {/* MAIN CONTENT */}

            <div
                style={{
                    padding: "10px"
                }}
            >

                <div
                    style={{
                        marginTop: "10px",
                        fontWeight: "bold"
                    }}
                >
                    Current Location: {state.currentLocation}
                </div>

            </div>

        </div>
    );
}
