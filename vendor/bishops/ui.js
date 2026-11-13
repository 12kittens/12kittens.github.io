import { Game, PositionView, numberToSquare, squareToNumber } from "./core.js";
//#region src/assets/styles/core.css?inline
var core_default = ":host {\r\n    display: block;\r\n    width: 100%;\r\n    aspect-ratio: 7 / 5;\r\n}\r\n\r\n.chess-ui-white-square, .chess-ui-black-square {\r\n    border: none;\r\n    box-sizing: border-box;\r\n    padding: 0;\r\n}\r\n\r\n.chess-ui-choose-promotion-overlay-wrapper {\r\n    grid-area: b;\r\n    z-index: 100;\r\n    display: grid;\r\n}\r\n\r\n.chess-ui-choose-promotion-overlay-wrapper.chess-ui-hidden {\r\n    display: none;\r\n}\r\n\r\n.chess-ui-choose-promotion-list {\r\n    height: 15%;\r\n    width: fit-content;\r\n    margin: auto auto;\r\n}\r\n\r\n.chess-ui-promotion-choice {\r\n    height: 80%;\r\n    margin-top: 0;\r\n    margin-bottom: 0;\r\n    margin-left: 4px;\r\n    margin-right: 4px;\r\n    aspect-ratio: 1 / 1;\r\n    background-size: 600%;\r\n    position: relative;\r\n    top: 10%;\r\n    background-color: #00000000;\r\n    border: none;\r\n}\r\n\r\n.chess-ui-main-container {\r\n    display: grid;\r\n    grid-template-columns: auto 1fr;\r\n    grid-template-rows: 100%;\r\n    width: 100%;\r\n    height: 100%;\r\n    grid-template-areas: 'b c';         \r\n    overflow: hidden;\r\n}\r\n.chess-ui-main-container:focus-visible {\r\n    outline: none;\r\n}\r\n\r\n.chess-ui-main-container.chess-ui-display-player-bar {\r\n    grid-template-areas: 'a a' 'b c' 'd d';\r\n    grid-template-rows: 25px calc(100% - 50px) 25px;\r\n}\r\n\r\n.chess-ui-pgn-row {\r\n    display: grid;\r\n    grid-template-rows: 100%;\r\n    grid-template-columns: 40px calc(50% - 20px) calc(50% - 20px);\r\n}\r\n\r\n.chess-ui-pgn-variant .chess-ui-pgn-row {\r\n    display: inline;\r\n    overflow-wrap: anywhere;\r\n    width: 100%\r\n}\r\n.chess-ui-pgn-variant .chess-ui-pgn-cell, .chess-ui-pgn-variant .chess-ui-pgn-number {\r\n    display: inline;\r\n    padding: 0 2px;\r\n}\r\n\r\n.chess-ui-pgn-variant .chess-ui-pgn-variant {\r\n    display: inline;\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n.chess-ui-pgn-variant .chess-ui-pgn-variant::after {\r\n    content: ')';\r\n    font-family: sans-serif;\r\n    color: #ffffff;\r\n}\r\n.chess-ui-pgn-variant .chess-ui-pgn-variant::before {\r\n    content: '(';\r\n    font-family: sans-serif;\r\n    color: #ffffff\r\n}\r\n\r\n.chess-ui-player1-bar {\r\n    grid-area: a;\r\n}\r\n.chess-ui-player2-bar {\r\n    grid-area: d;\r\n}\r\n.chess-ui-board-wrapper {\r\n    aspect-ratio: 1 / 1;\r\n    height: 100%;\r\n    grid-area: b;\r\n}\r\n\r\n.chess-ui-board {\r\n    width: auto;\r\n    aspect-ratio: 1 / 1;\r\n}\r\n\r\n.chess-ui-board-underlay {\r\n    width: 100%;\r\n    height: 100%;\r\n    display: grid;\r\n    grid-template-columns: repeat(8, 12.5%);\r\n    grid-template-rows: repeat(8, 12.5%);\r\n    overflow: hidden;\r\n    z-index: 0;\r\n    position: relative;\r\n}\r\n\r\n.chess-ui-board-overlay {\r\n    height: 0;\r\n    width: 100%;\r\n    z-index: 2;\r\n    position: relative;\r\n}\r\n\r\n.chess-ui-piece {\r\n    aspect-ratio: 1 / 1;\r\n    width: 12.5%;\r\n}\r\n\r\n.chess-ui-side-panel-wrapper {\r\n    grid-area: c;\r\n    display: grid;\r\n    grid-template-columns: 100%;\r\n    grid-template-rows: 1fr auto;\r\n}\r\n\r\n.chess-ui-game-control {\r\n    aspect-ratio: 7 / 2;\r\n    display: grid;\r\n    grid-template-columns: repeat(4, 25%);\r\n    padding: 2%;\r\n}\r\n\r\n.chess-ui-game-control-button {\r\n    aspect-ratio: 1 / 1;\r\n    margin: 2px;\r\n    padding: 0;\r\n}\r\n\r\n.chess-ui-game-control-button-icon {\r\n    mask-size: 400%;\r\n    mask-repeat: none;\r\n    height: 100%;\r\n    width: 100%;\r\n}\r\n\r\n.chess-ui-pgn-container {\r\n    width: 100%;\r\n    height: 100%;\r\n    overflow-y: scroll;\r\n    overflow-x: hidden;\r\n}\r\n\r\n.chess-ui-piece {\r\n    position: absolute;\r\n    background-size: 600%;\r\n    background-color: #00000000;\r\n    border: none;\r\n    cursor: pointer;\r\n}\r\n\r\n.chess-ui-player1-bar, .chess-ui-player2-bar {\r\n    display: grid;\r\n    grid-template-columns: auto 1fr;\r\n}\r\n\r\n.chess-ui-main-container:not(.chess-ui-display-player-bar) {\r\n    & > .chess-ui-player1-bar, & > .chess-ui-player2-bar {\r\n        display: none;\r\n    }\r\n}\r\n\r\n.chess-ui-info-wrapper {\r\n    grid-column: 1 / 3;\r\n    grid-row: 1 / 4;\r\n    z-index: 3;\r\n    height: 100%;\r\n    display: flex;\r\n}\r\n\r\n.chess-ui-info {\r\n    margin: auto;\r\n    width: calc(100% - 10px);\r\n    max-width: 400px;\r\n    height: calc(100% - 10px);\r\n    max-height: 300px;\r\n    align-self: center;\r\n    overflow-y: auto;\r\n}\r\n\r\n.chess-ui-info-wrapper.chess-ui-info-wrapper-hidden {\r\n    display: none;\r\n}";
//#endregion
//#region src/assets/styles/modern-light.css?inline
var modern_light_default = ":host {\r\n    color-scheme: light;\r\n}\r\n\r\n.chess-ui-black-square {\r\n    background-color: #815e3fb0;\r\n}\r\n\r\n.chess-ui-white-square {\r\n    background-color: #ffffffd0;\r\n}\r\n\r\n.chess-ui-pgn-container, .chess-ui-game-control {\r\n    width: auto;\r\n    margin: 2px;\r\n    margin-left: 4px;\r\n    margin-right: 0;\r\n    height: calc(100% - 4px);\r\n    border-radius: 15px;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    border-color: #808080;\r\n    box-sizing: border-box;\r\n    color: #000000;\r\n    background: \r\n    radial-gradient(ellipse at bottom right, #ffffd070, #ffd0d020),\r\n    radial-gradient(ellipse at top left, #e0e2ffd0, #f0f0f0c8);\r\n}\r\n\r\n.chess-ui-pgn-cell, .chess-ui-pgn-number {\r\n    padding: 2px 5px;\r\n    color: #000000;\r\n    font-family: system-ui;\r\n}\r\n\r\n.chess-ui-player1-bar, .chess-ui-player2-bar {\r\n    border-radius: 8px;\r\n    font-family: 'Segoe UI', sans-serif;\r\n    color: #505050;\r\n}\r\n\r\n.chess-ui-board {\r\n    width: auto;\r\n    margin: 2px;\r\n    margin-left: 0px;\r\n    margin-right: 4px;\r\n    aspect-ratio: 1 / 1;\r\n    border-radius: 15px;\r\n    border-style: solid;\r\n    border-width: 1px;\r\n    overflow: hidden;\r\n    border-color: #404040;\r\n    background: \r\n    radial-gradient(ellipse at bottom right, #c0c0a070, transparent),\r\n    radial-gradient(ellipse at top left, #a0a0c0d0, #807870c8);\r\n}\r\n/*\r\n.chess-ui-main-container.chess-ui-display-player-bar {\r\n    grid-template-rows: 33px calc(100% - 66px) 33px;\r\n}*/\r\n.chess-ui-player-bar-clock {\r\n    margin: 5px;\r\n    aspect-ratio: 1/1;\r\n    border-color: #ffffff;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    border-radius: 7px;\r\n    height: 13px;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-display-clock {\r\n    aspect-ratio: 4/1;\r\n    height: 17px;\r\n    margin: 3px;\r\n    padding: 0;\r\n    line-height: 16px;\r\n    text-align: center;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-white-clock {\r\n    color: #808080;\r\n    border-color: #d0d0d0b0;\r\n}\r\n.chess-ui-player-bar-clock.chess-ui-black-clock {\r\n    color: #808080;\r\n    border-color: #000000b0;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-black-clock.chess-ui-selected {\r\n    color: #ffffff;\r\n    background-color: #101010a0;\r\n    border-color: #ffffff;\r\n}\r\n\r\n\r\n.chess-ui-player-bar-clock.chess-ui-white-clock.chess-ui-selected {\r\n    color: #000000;\r\n    background-color: #d0d0d0a0;\r\n    border-color: #000000;\r\n}\r\n\r\n.chess-ui-player-bar-name {\r\n    align-content: center;\r\n}\r\n\r\n.chess-ui-pgn-cell {\r\n    border: none;\r\n    background: none;\r\n    text-align: left;\r\n    font-size: inherit;\r\n}\r\n.chess-ui-pgn-cell:hover {\r\n    background-color: #b0b0d070;\r\n    border-radius: 4px;\r\n    cursor: pointer;\r\n}\r\n\r\n.chess-ui-pgn-variant:not(.chess-ui-pgn-variant .chess-ui-pgn-variant) {\r\n    border-radius: 8px;\r\n    background-color: #a0a0a060;\r\n    margin: 3px 5px;\r\n    padding: 4px 8px;\r\n    font-size: 11pt;\r\n    border-radius: 13px;\r\n}\r\n.chess-ui-pgn-comment {\r\n    font-family: system-ui;\r\n}\r\n\r\n.chess-ui-pgn-container::-webkit-scrollbar {\r\n  width: 8px;\r\n  height: 8px;\r\n}\r\n\r\n/* Add a thumb */\r\n.chess-ui-pgn-container::-webkit-scrollbar-thumb {\r\n    background-color: #00000060;\r\n    border-radius: 4px;\r\n}\r\n\r\n.chess-ui-pgn-container::-webkit-scrollbar-thumb:hover {\r\n    background-color: #000000a0;\r\n    border-radius: 4px;\r\n}\r\n\r\n.chess-ui-pgn-comment:not(.chess-ui-pgn-variant .chess-ui-pgn-comment) {\r\n    background-color: #a0a0a060;\r\n    border-radius: 13px;\r\n    margin: 3px 5px;\r\n    padding: 4px 8px;\r\n    font-size: 11pt;\r\n}\r\n\r\n.chess-ui-pgn-result {\r\n    border-radius: 8px;\r\n    margin: 2px 5px;\r\n    padding: 12px;\r\n    font-family: system-ui;\r\n    color: #000000;\r\n    text-align: center;\r\n    font-weight: bold;\r\n}\r\n\r\n.chess-ui-piece {\r\n    transition:\r\n    margin-top 200ms ease-in-out,\r\n    margin-left 200ms ease-in-out,\r\n    background-color 300ms ease-in-out;\r\n}\r\n\r\n.chess-ui-last-move {\r\n    background-color: #0030b040;\r\n    border-radius: 12px;\r\n}\r\n.chess-ui-king-check {\r\n    background-color: #ff3030a0;\r\n    border-radius: 12px;\r\n}\r\n\r\n.chess-ui-pgn-cell-nag1 {\r\n    color: #008000;\r\n}\r\n.chess-ui-pgn-cell-nag2 {\r\n    color: #808000;\r\n}\r\n.chess-ui-pgn-cell-nag3 {\r\n    color: #800080;\r\n}\r\n.chess-ui-pgn-cell-nag4 {\r\n    color: #800000;\r\n}\r\n.chess-ui-pgn-cell-nag5 {\r\n    color: #400080;\r\n}\r\n.chess-ui-pgn-cell-nag6 {\r\n    color: #808000;\r\n}\r\n.chess-ui-name-title {\r\n    color: #b000ff;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-winner {\r\n    color: #20e020;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-loser {\r\n    color: #f02020;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-draw {\r\n    color: #808080;\r\n    font-weight: bolder;\r\n}\r\n\r\n.chess-ui-possible-move:not(.chess-ui-possible-capture)::after {\r\n    margin: 25%;\r\n    border-radius: 30%;\r\n    background-color: #70ff50a0;\r\n    content: ' ';\r\n    width: 50%;\r\n    height: 50%;\r\n    display: block;\r\n}\r\n\r\n.chess-ui-possible-move.chess-ui-possible-capture::after {\r\n    margin: 0;\r\n    border-radius: 30%;\r\n    border-width: 40%;\r\n    border-color: #70ff50a0;\r\n    border-style: solid;\r\n    box-sizing: border-box;\r\n    background-color: #00000000;\r\n    content: ' ';\r\n    width: 100%;\r\n    height: 100%;\r\n    display: block;\r\n}\r\n\r\n\r\n.chess-ui-choose-promotion-overlay-wrapper {\r\n    backdrop-filter: blur(10px);\r\n    margin-right: 4px;\r\n    margin-top: 2px;\r\n    margin-bottom: 2px;\r\n    background-color: #00000030;\r\n    border-radius: 15px;\r\n}\r\n\r\n.chess-ui-choose-promotion-list {\r\n    border-radius: 10px;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    background: \r\n    radial-gradient(ellipse at bottom right, #ffffd070, #ffd0d020),\r\n    radial-gradient(ellipse at top left, #e0e2ffd0, #f0f0f0c8);\r\n    border-width: 1px;\r\n    border-color: #404040;\r\n}\r\n\r\n.chess-ui-promotion-choice {\r\n    cursor: pointer;\r\n    transition: background-color 300ms ease-in-out;\r\n    border-radius: 8px;\r\n    cursor: pointer;\r\n}\r\n.chess-ui-promotion-choice:hover {\r\n    background-color: #00081040;\r\n}\r\n\r\n.chess-ui-game-control-button {\r\n    background-color: #00000000;\r\n    border: none;\r\n    transition: background-color 300ms ease-in-out;\r\n    border-radius: 8px;\r\n    cursor: pointer;\r\n}\r\n.chess-ui-game-control-button-icon {\r\n    background-color: #000000;\r\n}\r\n.chess-ui-game-control-button:hover {\r\n    background-color: #00081040;\r\n}\r\n\r\n.chess-ui-info-wrapper {\r\n    background-color: #00000030;\r\n    backdrop-filter: blur(10px);\r\n    border-radius: 15px;\r\n}\r\n\r\n.chess-ui-info {\r\n    border-radius: 10px;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    background: \r\n    radial-gradient(ellipse at bottom right, #ffffd090, #ffd0d030),\r\n    radial-gradient(ellipse at top left, #e0e2ffe0, #f0f0f0d8);\r\n    border-width: 1px;\r\n    border-color: #707070;\r\n}\r\n\r\n.chess-ui-info-list {\r\n    font-family: system-ui, sans-serif;\r\n    list-style: none;\r\n}";
//#endregion
//#region src/assets/styles/modern-dark.css?inline
var modern_dark_default = ":host {\r\n    color-scheme: dark;\r\n}\r\n\r\n.chess-ui-pgn-cell, .chess-ui-pgn-number {\r\n    padding: 2px 5px;\r\n    color: #ffffff;\r\n    font-family: system-ui;\r\n}\r\n\r\n.chess-ui-black-square {\r\n    background-color: #784a2290;\r\n}\r\n\r\n.chess-ui-white-square {\r\n    background-color: #ffffffe8;\r\n}\r\n\r\n.chess-ui-pgn-container, .chess-ui-game-control {\r\n    width: auto;\r\n    margin: 2px;\r\n    margin-left: 4px;\r\n    margin-right: 0;\r\n    height: calc(100% - 4px);\r\n    border-radius: 15px;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    box-sizing: border-box;\r\n    border-color: #606060;\r\n    background: \r\n    radial-gradient(ellipse at top left, #50443870, transparent),\r\n    radial-gradient(ellipse at bottom right, #282a2cd0, #201e1dc8);\r\n}\r\n\r\n.chess-ui-player1-bar, .chess-ui-player2-bar {\r\n    border-radius: 8px;\r\n    font-family: 'Segoe UI', sans-serif;\r\n    color: #909090;\r\n}\r\n\r\n.chess-ui-board {\r\n    width: auto;\r\n    margin: 2px;\r\n    margin-left: 0px;\r\n    margin-right: 4px;\r\n    aspect-ratio: 1 / 1;\r\n    border-radius: 15px;\r\n    border-style: solid;\r\n    border-width: 1px;\r\n    overflow: hidden;\r\n    border-color: #b0b0b0;\r\n    background: \r\n    radial-gradient(ellipse at top left, #90686070, transparent),\r\n    radial-gradient(ellipse at bottom right, #606890d0, #504840c8);\r\n}\r\n/*\r\n.chess-ui-main-container.chess-ui-display-player-bar {\r\n    grid-template-rows: 33px calc(100% - 66px) 33px;\r\n}*/\r\n.chess-ui-player-bar-clock {\r\n    margin: 5px;\r\n    aspect-ratio: 1/1;\r\n    border-color: #ffffff;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    border-radius: 7px;\r\n    height: 13px;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-display-clock {\r\n    aspect-ratio: 4/1;\r\n    height: 17px;\r\n    margin: 3px;\r\n    padding: 0;\r\n    line-height: 16px;\r\n    text-align: center;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-white-clock {\r\n    color: #808080;\r\n    border-color: #d0d0d0b0;\r\n}\r\n.chess-ui-player-bar-clock.chess-ui-black-clock {\r\n    color: #808080;\r\n    border-color: #404040b0;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-black-clock.chess-ui-selected {\r\n    color: #ffffff;\r\n    background-color: #504840a0;\r\n    border-color: #ffffff;\r\n}\r\n\r\n\r\n.chess-ui-player-bar-clock.chess-ui-white-clock.chess-ui-selected {\r\n    color: #000000;\r\n    background-color: #d0d0d0c0;\r\n    border-color: #808080;\r\n}\r\n\r\n.chess-ui-player-bar-name {\r\n    align-content: center;\r\n}\r\n\r\n.chess-ui-pgn-cell {\r\n    border: none;\r\n    background: none;\r\n    text-align: left;\r\n    font-size: inherit;\r\n}\r\n.chess-ui-pgn-cell:hover {\r\n    background-color: #686868;\r\n    cursor: pointer;\r\n    border-radius: 4px;\r\n}\r\n\r\n.chess-ui-pgn-variant:not(.chess-ui-pgn-variant .chess-ui-pgn-variant) {\r\n    border-radius: 8px;\r\n    background-color: #00000040;\r\n    margin: 3px 5px;\r\n    padding: 4px 8px;\r\n    font-size: 11pt;\r\n    border-radius: 13px;\r\n}\r\n.chess-ui-pgn-comment {\r\n    color: #ffffff;\r\n    font-family: system-ui;\r\n}\r\n\r\n.chess-ui-pgn-container::-webkit-scrollbar {\r\n  width: 8px;\r\n  height: 8px;\r\n}\r\n\r\n/* Add a thumb */\r\n.chess-ui-pgn-container::-webkit-scrollbar-thumb {\r\n    background-color: #ffffff60;\r\n    border-radius: 4px;\r\n}\r\n\r\n.chess-ui-pgn-container::-webkit-scrollbar-thumb:hover {\r\n    background-color: #ffffffa0;\r\n    border-radius: 4px;\r\n}\r\n\r\n.chess-ui-pgn-comment:not(.chess-ui-pgn-variant .chess-ui-pgn-comment) {\r\n    background-color: #00000040;\r\n    border-radius: 13px;\r\n    margin: 3px 5px;\r\n    padding: 4px 8px;\r\n    font-size: 11pt;\r\n}\r\n\r\n.chess-ui-pgn-result {\r\n    border-radius: 8px;\r\n    margin: 2px 5px;\r\n    padding: 12px;\r\n    font-family: system-ui;\r\n    color: #ffffff;\r\n    text-align: center;\r\n    font-weight: bold;\r\n}\r\n\r\n.chess-ui-piece {\r\n    transition:\r\n    margin-top 200ms ease-in-out,\r\n    margin-left 200ms ease-in-out,\r\n    background-color 300ms ease-in-out;\r\n}\r\n\r\n.chess-ui-last-move {\r\n    background-color: #0030b040;\r\n    border-radius: 12px;\r\n}\r\n.chess-ui-king-check {\r\n    background-color: #ff3030a0;\r\n    border-radius: 12px;\r\n}\r\n\r\n.chess-ui-pgn-cell-nag1 {\r\n    color: #40ff40;\r\n}\r\n.chess-ui-pgn-cell-nag2 {\r\n    color: #ffb050;\r\n}\r\n.chess-ui-pgn-cell-nag3 {\r\n    color: #ff00ff;\r\n}\r\n.chess-ui-pgn-cell-nag4 {\r\n    color: #ff9090;\r\n}\r\n.chess-ui-pgn-cell-nag5 {\r\n    color: #b050ff;\r\n}\r\n.chess-ui-pgn-cell-nag6 {\r\n    color: #ffff20;\r\n}\r\n.chess-ui-name-title {\r\n    color: #b000ff;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-winner {\r\n    color: #20ff20;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-loser {\r\n    color: #ff4040;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-draw {\r\n    color: #a0a0a0;\r\n    font-weight: bolder;\r\n}\r\n\r\n\r\n.chess-ui-possible-move::after {\r\n    margin: 25%;\r\n    border-radius: 30%;\r\n    background-color: #70ff50a0;\r\n    content: ' ';\r\n    width: 50%;\r\n    height: 50%;\r\n    display: block;\r\n}\r\n\r\n.chess-ui-possible-move.chess-ui-possible-capture::after {\r\n    margin: 0;\r\n    border-radius: 30%;\r\n    border-width: 40%;\r\n    border-color: #20ff30a0;\r\n    border-style: solid;\r\n    box-sizing: border-box;\r\n    background-color: #00000000;\r\n    content: ' ';\r\n    width: 100%;\r\n    height: 100%;\r\n    display: block;\r\n}\r\n\r\n.chess-ui-choose-promotion-overlay-wrapper {\r\n    backdrop-filter: blur(10px);\r\n    margin-right: 4px;\r\n    margin-top: 2px;\r\n    margin-bottom: 2px;\r\n    background-color: #00000080;\r\n    border-radius: 15px;\r\n}\r\n\r\n.chess-ui-choose-promotion-list {\r\n    border-radius: 10px;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    background: \r\n    radial-gradient(ellipse at top left, #90686070, transparent),\r\n    radial-gradient(ellipse at bottom right, #606890d0, #504840c8);\r\n    border-width: 1px;\r\n    border-color: #b0b0b0;\r\n}\r\n\r\n.chess-ui-promotion-choice {\r\n    cursor: pointer;\r\n    transition: background-color 300ms ease-in-out;\r\n    border-radius: 8px;\r\n}\r\n.chess-ui-promotion-choice:hover {\r\n    background-color: #30405080;\r\n}\r\n\r\n.chess-ui-game-control-button {\r\n    background-color: #00000000;\r\n    border: none;\r\n    transition: background-color 300ms ease-in-out;\r\n    border-radius: 8px;\r\n    cursor: pointer;\r\n}\r\n.chess-ui-game-control-button-icon {\r\n    background-color: #ffffffd0;\r\n}\r\n.chess-ui-game-control-button:hover {\r\n    background-color: #ffffff30;\r\n}\r\n\r\n.chess-ui-info-wrapper {\r\n    background-color: #00000080;\r\n    backdrop-filter: blur(10px);\r\n    border-radius: 15px;\r\n}\r\n\r\n.chess-ui-info {\r\n    border-radius: 10px;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    background: \r\n    radial-gradient(ellipse at top left, #503a3698, transparent),\r\n    radial-gradient(ellipse at bottom right, #33374de0, #27231fd0);\r\n    border-width: 1px;\r\n    border-color: #707070;\r\n}\r\n\r\n.chess-ui-info-list {\r\n    font-family: system-ui, sans-serif;\r\n    list-style: none;\r\n}\r\n.chess-ui-info-list {\r\n    color: #ffffff;\r\n}";
//#endregion
//#region src/assets/styles/classic.css?inline
var classic_default = ":host {\r\n    color-scheme: dark;\r\n}\r\n.chess-ui-pgn-cell, .chess-ui-pgn-number {\r\n    padding: 2px 5px;\r\n    color: #ffffff;\r\n    font-family: system-ui;\r\n}\r\n.chess-ui-black-square {\r\n    background-color: #ae7b4f;\r\n}\r\n\r\n.chess-ui-white-square {\r\n    background-color: #f9eecc;\r\n}\r\n\r\n.chess-ui-pgn-container {\r\n    background-color: #605850;\r\n}\r\n\r\n.chess-ui-player1-bar, .chess-ui-player2-bar {\r\n    background-color: #403830;\r\n    font-family: 'Segoe UI', sans-serif;\r\n    color: #ffffff;\r\n}\r\n\r\n.chess-ui-player-bar-clock {\r\n    margin: 5px;\r\n    aspect-ratio: 1/1;\r\n    border-color: #ffffff;\r\n    border-width: 1px;\r\n    border-style: solid;\r\n    border-radius: 4px;\r\n    height: 13px;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-display-clock {\r\n    aspect-ratio: 4/1;\r\n    height: 17px;\r\n    margin: 3px;\r\n    padding: 0;\r\n    line-height: 16px;\r\n    text-align: center;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-white-clock {\r\n    color: #ffffff;\r\n    border-color: #ffffff80;\r\n}\r\n.chess-ui-player-bar-clock.chess-ui-black-clock {\r\n    color: #ffffff;\r\n    border-color: #000000;\r\n}\r\n\r\n.chess-ui-player-bar-clock.chess-ui-black-clock.chess-ui-selected {\r\n    color: #ffffff;\r\n    background-color: #101010;\r\n    border-color: #ffffff;\r\n}\r\n\r\n\r\n.chess-ui-player-bar-clock.chess-ui-white-clock.chess-ui-selected {\r\n    color: #000000;\r\n    background-color: #ffffff;\r\n    border-color: #000000;\r\n}\r\n\r\n.chess-ui-player-bar-name {\r\n    align-content: center;\r\n}\r\n\r\n.chess-ui-pgn-cell {\r\n    border: none;\r\n    background: none;\r\n    text-align: left;\r\n    font-size: inherit;\r\n}\r\n.chess-ui-pgn-cell:hover {\r\n    background-color: #686868;\r\n    cursor: pointer;\r\n}\r\n\r\n.chess-ui-pgn-variant:not(.chess-ui-pgn-variant .chess-ui-pgn-variant) {\r\n    border-radius: 8px;\r\n    background-color: #504840;\r\n    margin: 2px 5px;\r\n    padding: 4px;\r\n    font-size: 11pt;\r\n}\r\n.chess-ui-pgn-comment {\r\n    color: #ffffff;\r\n    font-family: system-ui;\r\n}\r\n.chess-ui-pgn-comment:not(.chess-ui-pgn-variant .chess-ui-pgn-comment) {\r\n    border-radius: 8px;\r\n    background-color: #504840;\r\n    margin: 2px 5px;\r\n    padding: 4px;\r\n    font-size: 11pt;\r\n}\r\n\r\n.chess-ui-pgn-result {\r\n    border-radius: 8px;\r\n    margin: 2px 5px;\r\n    padding: 12px;\r\n    font-family: system-ui;\r\n    color: #ffffff;\r\n    text-align: center;\r\n    font-weight: bold;\r\n}\r\n/*\r\n.chess-ui-piece:hover {\r\n    background-color: #00ffff80;\r\n}\r\n*/\r\n\r\n.chess-ui-piece {\r\n    transition:\r\n    margin-top 200ms ease-in-out,\r\n    margin-left 200ms ease-in-out,\r\n    background-color 300ms ease-in-out;\r\n}\r\n\r\n.chess-ui-last-move {\r\n    background-color: #4040ff80;\r\n    border-radius: 12px;\r\n}\r\n.chess-ui-king-check {\r\n    background-color: #ff3030a0;\r\n    border-radius: 12px;\r\n}\r\n\r\n.chess-ui-pgn-cell-nag1 {\r\n    color: #40ff40;\r\n}\r\n.chess-ui-pgn-cell-nag2 {\r\n    color: #ffb050;\r\n}\r\n.chess-ui-pgn-cell-nag3 {\r\n    color: #ff00ff;\r\n}\r\n.chess-ui-pgn-cell-nag4 {\r\n    color: #ff9090;\r\n}\r\n.chess-ui-pgn-cell-nag5 {\r\n    color: #b050ff;\r\n}\r\n.chess-ui-pgn-cell-nag6 {\r\n    color: #ffff20;\r\n}\r\n.chess-ui-name-title {\r\n    color: #ff50ff;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-winner {\r\n    color: #50ff50;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-loser {\r\n    color: #ff7070;\r\n    font-weight: bolder;\r\n}\r\n.chess-ui-name-result-draw {\r\n    color: #a0a0a0;\r\n    font-weight: bolder;\r\n}\r\n\r\n.chess-ui-possible-move::after {\r\n    margin: 25%;\r\n    border-radius: 30%;\r\n    background-color: #70ff50;\r\n    content: ' ';\r\n    width: 50%;\r\n    height: 50%;\r\n    display: block;\r\n}\r\n\r\n.chess-ui-possible-move.chess-ui-possible-capture::after {\r\n    margin: 0;\r\n    border-radius: 30%;\r\n    border-width: 40%;\r\n    border-color: #20ff30a0;\r\n    border-style: solid;\r\n    box-sizing: border-box;\r\n    background-color: #00000000;\r\n    content: ' ';\r\n    width: 100%;\r\n    height: 100%;\r\n    display: block;\r\n}\r\n\r\n.chess-ui-choose-promotion-overlay-wrapper {\r\n    background-color: #000000a0;\r\n}\r\n\r\n.chess-ui-choose-promotion-list {\r\n    background-color: #605038;\r\n    padding: 4px;\r\n}\r\n\r\n.chess-ui-promotion-choice {\r\n    cursor: pointer;\r\n}\r\n.chess-ui-promotion-choice:hover {\r\n    background-color: #686868;\r\n}\r\n\r\n.chess-ui-game-control {\r\n    background-color: #3d3b39;\r\n}\r\n\r\n.chess-ui-game-control-button {\r\n    background-color: #00000000;\r\n    border: none;\r\n    cursor: pointer;\r\n    margin: 10% 0%;\r\n}\r\n.chess-ui-game-control-button-icon {\r\n    background-color: #ffffffd0;\r\n}\r\n.chess-ui-game-control-button:hover {\r\n    background-color: #ffffff30;\r\n}\r\n\r\n.chess-ui-info-wrapper {\r\n    background-color: #000000b0;\r\n}\r\n\r\n.chess-ui-info {\r\n    background-color: #404040;\r\n    border-radius: 8px;\r\n}\r\n\r\n.chess-ui-info-list {\r\n    font-family: system-ui, sans-serif;\r\n    list-style: none;\r\n}\r\n.chess-ui-info-list {\r\n    color: #ffffff;\r\n}";
//#endregion
//#region src/assets/images/pieces.svg?inline
var pieces_default = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Created%20with%20Inkscape%20(http://www.inkscape.org/)%20--%3e%3csvg%20width='288'%20height='96'%20viewBox='0%200%2076.199998%2025.4'%20version='1.1'%20id='svg1'%20xml:space='preserve'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:svg='http://www.w3.org/2000/svg'%3e%3cdefs%20id='defs1'%20/%3e%3cg%20id='layer2'%20style='display:none'%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1'%20width='12.7'%20height='12.7'%20x='0'%20y='0'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-4'%20width='12.7'%20height='12.7'%20x='12.7'%20y='-3.3306691e-16'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-6'%20width='12.7'%20height='12.7'%20x='-2.6645353e-15'%20y='12.7'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-4-8'%20width='12.7'%20height='12.7'%20x='12.7'%20y='12.7'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-49'%20width='12.7'%20height='12.7'%20x='25.4'%20y='-1.7763568e-15'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-4-2'%20width='12.7'%20height='12.7'%20x='38.099998'%20y='-1.7763568e-15'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-2'%20width='12.7'%20height='12.7'%20x='25.4'%20y='12.7'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-4-6'%20width='12.7'%20height='12.7'%20x='38.099998'%20y='12.7'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-0'%20width='12.7'%20height='12.7'%20x='50.799995'%20y='-2.6645353e-15'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-4-4'%20width='12.7'%20height='12.7'%20x='63.499996'%20y='-2.6645353e-15'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-27'%20width='12.7'%20height='12.7'%20x='50.799995'%20y='12.7'%20/%3e%3crect%20style='fill:%23e6decc;fill-opacity:1;stroke-width:0.206768'%20id='rect1-4-22'%20width='12.7'%20height='12.7'%20x='63.499996'%20y='12.7'%20/%3e%3c/g%3e%3cg%20id='layer1'%3e%3cg%20fill='%23ffffff'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g5'%20transform='matrix(0.26458333,0,0,0.26458333,0.39687498,12.7)'%3e%3cpath%20stroke-linecap='butt'%20d='M%209,39%20H%2036%20V%2036%20H%209%20Z%20m%203,-3%20v%20-4%20h%2021%20v%204%20z%20M%2011,14%20V%209%20h%204%20v%202%20h%205%20V%209%20h%205%20v%202%20h%205%20V%209%20h%204%20v%205'%20id='path1'%20/%3e%3cpath%20d='m%2034,14%20-3,3%20H%2014%20l%20-3,-3'%20id='path2'%20/%3e%3cpath%20stroke-linecap='butt'%20stroke-linejoin='miter'%20d='M%2031,17%20V%2029.5%20H%2014%20V%2017'%20id='path3'%20/%3e%3cpath%20d='m%2031,29.5%201.5,2.5%20h%20-20%20L%2014,29.5'%20id='path4'%20/%3e%3cpath%20fill='none'%20stroke-linejoin='miter'%20d='M%2011,14%20H%2034'%20id='path5'%20/%3e%3c/g%3e%3cg%20fill='%23ffffff'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g4-3'%20transform='matrix(0.26458333,0,0,0.26458333,38.496873,13.129357)'%3e%3cpath%20d='m%208,12%20a%202,2%200%201%201%20-4,0%202,2%200%201%201%204,0%20M%2024.5,7.5%20a%202,2%200%201%201%20-4,0%202,2%200%201%201%204,0%20M%2041,12%20a%202,2%200%201%201%20-4,0%202,2%200%201%201%204,0%20M%2016,8.5%20a%202,2%200%201%201%20-4,0%202,2%200%201%201%204,0%20M%2033,9%20a%202,2%200%201%201%20-4,0%202,2%200%201%201%204,0'%20id='path1-5'%20/%3e%3cpath%20stroke-linecap='butt'%20d='m%209,26%20c%208.5,-1.5%2021,-1.5%2027,0%20L%2038,14%2031,25%20V%2011%20l%20-5.5,13.5%20-3,-15%20-3,15%20-5.5,-14%20V%2025%20L%207,14%20Z'%20id='path2-62'%20/%3e%3cpath%20stroke-linecap='butt'%20d='m%209,26%20c%200,2%201.5,2%202.5,4%201,1.5%201,1%200.5,3.5%20-1.5,1%20-1.5,2.5%20-1.5,2.5%20-1.5,1.5%200.5,2.5%200.5,2.5%206.5,1%2016.5,1%2023,0%200,0%201.5,-1%200,-2.5%200,0%200.5,-1.5%20-1,-2.5%20-0.5,-2.5%20-0.5,-2%200.5,-3.5%201,-2%202.5,-2%202.5,-4%20-8.5,-1.5%20-18.5,-1.5%20-27,0%20z'%20id='path3-9'%20/%3e%3cpath%20fill='none'%20d='M%2011.5,30%20C%2015,29%2030,29%2033.5,30%20M%2012,33.5%20c%206,-1%2015,-1%2021,0'%20id='path4-1'%20/%3e%3c/g%3e%3cpath%20fill='%23ffffff'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-width='1.5'%20d='m%2069.849996,15.0151%20c%20-0.58473,0%20-1.05833,0.47361%20-1.05833,1.05834%200,0.23548%200.0767,0.45243%200.20637,0.62971%20-0.51594,0.29633%20-0.86783,0.84931%20-0.86783,1.48695%200,0.53711%200.24871,1.016%200.63764,1.33086%20-0.79375,0.28046%20-1.96056,1.46844%20-1.96056,3.56394%20h%206.08542%20c%200,-2.0955%20-1.16681,-3.28348%20-1.96056,-3.56394%200.38893,-0.31486%200.63764,-0.79375%200.63764,-1.33086%200,-0.63764%20-0.35189,-1.19062%20-0.86783,-1.48695%200.12964,-0.17728%200.20637,-0.39423%200.20637,-0.62971%200,-0.58473%20-0.4736,-1.05834%20-1.05833,-1.05834%20z'%20id='path1-6'%20style='stroke-width:0.396875;stroke-dasharray:none'%20/%3e%3cg%20fill='none'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g3'%20transform='matrix(0.26458333,0,0,0.26458333,13.225297,12.964583)'%3e%3cpath%20fill='%23ffffff'%20d='m%2022,10%20c%2010.5,1%2016.5,8%2016,29%20H%2015%20c%200,-9%2010,-6.5%208,-21'%20id='path1-2'%20/%3e%3cpath%20fill='%23ffffff'%20d='m%2024,18%20c%200.38,2.91%20-5.55,7.37%20-8,9%20-3,2%20-2.82,4.34%20-5,4%20-1.042,-0.94%201.41,-3.04%200,-3%20-1,0%200.19,1.23%20-1,2%20-1,0%20-4.003,1%20-4,-4%200,-2%206,-12%206,-12%200,0%201.89,-1.9%202,-3.5%20-0.73,-0.994%20-0.5,-2%20-0.5,-3%201,-1%203,2.5%203,2.5%20h%202%20c%200,0%200.78,-1.992%202.5,-3%201,0%201,3%201,3'%20id='path2-61'%20/%3e%3cpath%20fill='%23000000'%20d='m%209.5,25.5%20a%200.5,0.5%200%201%201%20-1,0%200.5,0.5%200%201%201%201,0%20m%205.433,-9.75%20a%200.5,1.5%2030%201%201%20-0.866,-0.5%200.5,1.5%2030%201%201%200.866,0.5'%20id='path3-8'%20/%3e%3c/g%3e%3cg%20fill='none'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g4-7'%20transform='matrix(0.26458333,0,0,0.26458333,51.20518,13.014192)'%3e%3cpath%20stroke-linejoin='miter'%20d='M%2022.5,11.63%20V%206%20M%2020,8%20h%205'%20id='path1-92'%20/%3e%3cpath%20fill='%23ffffff'%20stroke-linecap='butt'%20stroke-linejoin='miter'%20d='m%2022.5,25%20c%200,0%204.5,-7.5%203,-10.5%200,0%20-1,-2.5%20-3,-2.5%20-2,0%20-3,2.5%20-3,2.5%20-1.5,3%203,10.5%203,10.5'%20id='path2-0'%20/%3e%3cpath%20fill='%23ffffff'%20d='m%2011.5,37%20c%205.5,3.5%2015.5,3.5%2021,0%20v%20-7%20c%200,0%209,-4.5%206,-10.5%20-4,-6.5%20-13.5,-3.5%20-16,4%20V%2027%2023.5%20C%2019,16%209.5,13%206.5,19.5%20c%20-3,6%205,10%205,10%20z'%20id='path3-2'%20/%3e%3cpath%20d='m%2011.5,30%20c%205.5,-3%2015.5,-3%2021,0%20m%20-21,3.5%20c%205.5,-3%2015.5,-3%2021,0%20m%20-21,3.5%20c%205.5,-3%2015.5,-3%2021,0'%20id='path4-3'%20/%3e%3c/g%3e%3cg%20fill='none'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g4-75'%20transform='matrix(0.26458333,0,0,0.26458333,25.796875,13.187324)'%3e%3cg%20fill='%23ffffff'%20stroke-linecap='butt'%20id='g3-9'%3e%3cpath%20d='m%209,36%20c%203.39,-0.97%2010.11,0.43%2013.5,-2%203.39,2.43%2010.11,1.03%2013.5,2%200,0%201.65,0.54%203,2%20-0.68,0.97%20-1.65,0.99%20-3,0.5%20-3.39,-0.97%20-10.11,0.46%20-13.5,-1%20C%2019.11,38.96%2012.39,37.53%209,38.5%207.65,38.99%206.68,38.97%206,38%207.35,36.06%209,36%209,36%20Z'%20id='path1-22'%20/%3e%3cpath%20d='m%2015,32%20c%202.5,2.5%2012.5,2.5%2015,0%200.5,-1.5%200,-2%200,-2%200,-2.5%20-2.5,-4%20-2.5,-4%205.5,-1.5%206,-11.5%20-5,-15.5%20-11,4%20-10.5,14%20-5,15.5%200,0%20-2.5,1.5%20-2.5,4%200,0%20-0.5,0.5%200,2%20z'%20id='path2-8'%20/%3e%3cpath%20d='m%2025,8%20a%202.5,2.5%200%201%201%20-5,0%202.5,2.5%200%201%201%205,0%20z'%20id='path3-97'%20/%3e%3c/g%3e%3cpath%20stroke-linejoin='miter'%20d='m%2017.5,26%20h%2010%20M%2015,30%20H%2030%20M%2022.5,15.5%20v%205%20M%2020,18%20h%205'%20id='path4-36'%20/%3e%3c/g%3e%3cg%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g4-1'%20transform='matrix(0.26458333,0,0,0.26458333,0.39687498,-1.5367432e-8)'%3e%3cpath%20stroke-linecap='butt'%20d='M%209,39%20H%2036%20V%2036%20H%209%20Z%20M%2012.5,32%2014,29.5%20H%2031%20L%2032.5,32%20Z%20M%2012,36%20v%20-4%20h%2021%20v%204%20z'%20id='path1-29'%20/%3e%3cpath%20stroke-linecap='butt'%20stroke-linejoin='miter'%20d='m%2014,29.5%20v%20-13%20h%2017%20v%2013%20z'%20id='path2-3'%20/%3e%3cpath%20stroke-linecap='butt'%20d='M%2014,16.5%2011,14%20h%2023%20l%20-3,2.5%20z%20M%2011,14%20V%209%20h%204%20v%202%20h%205%20V%209%20h%205%20v%202%20h%205%20V%209%20h%204%20v%205%20z'%20id='path3-1'%20/%3e%3cpath%20fill='none'%20stroke='%23ececec'%20stroke-linejoin='miter'%20stroke-width='1'%20d='m%2012,35.5%20h%2021%20m%20-20,-4%20h%2019%20m%20-18,-2%20H%2031%20M%2014,16.5%20H%2031%20M%2011,14%20h%2023'%20id='path4-9'%20/%3e%3c/g%3e%3cg%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g8'%20transform='matrix(0.26458333,0,0,0.26458333,38.496873,0.20595184)'%3e%3cg%20stroke='none'%20id='g5-4'%3e%3ccircle%20cx='6'%20cy='12'%20r='2.75'%20id='circle1'%20/%3e%3ccircle%20cx='14'%20cy='9'%20r='2.75'%20id='circle2'%20/%3e%3ccircle%20cx='22.5'%20cy='8'%20r='2.75'%20id='circle3'%20/%3e%3ccircle%20cx='31'%20cy='9'%20r='2.75'%20id='circle4'%20/%3e%3ccircle%20cx='39'%20cy='12'%20r='2.75'%20id='circle5'%20/%3e%3c/g%3e%3cpath%20stroke-linecap='butt'%20d='m%209,26%20c%208.5,-1.5%2021,-1.5%2027,0%20L%2038.5,13.5%2031,25%2030.7,10.9%2025.5,24.5%2022.5,10%2019.5,24.5%2014.3,10.9%2014,25%206.5,13.5%20Z'%20id='path5-7'%20/%3e%3cpath%20stroke-linecap='butt'%20d='m%209,26%20c%200,2%201.5,2%202.5,4%201,1.5%201,1%200.5,3.5%20-1.5,1%20-1.5,2.5%20-1.5,2.5%20-1.5,1.5%200.5,2.5%200.5,2.5%206.5,1%2016.5,1%2023,0%200,0%201.5,-1%200,-2.5%200,0%200.5,-1.5%20-1,-2.5%20-0.5,-2.5%20-0.5,-2%200.5,-3.5%201,-2%202.5,-2%202.5,-4%20-8.5,-1.5%20-18.5,-1.5%20-27,0%20z'%20id='path6'%20/%3e%3cpath%20fill='none'%20stroke-linecap='butt'%20d='m%2011,38.5%20a%2035,35%201%200%200%2023,0'%20id='path7'%20/%3e%3cpath%20fill='none'%20stroke='%23ececec'%20d='m%2011,29%20a%2035,35%201%200%201%2023,0%20m%20-21.5,2.5%20h%2020%20m%20-21,3%20a%2035,35%201%200%200%2022,0%20m%20-23,3%20a%2035,35%201%200%200%2024,0'%20id='path8'%20/%3e%3c/g%3e%3cpath%20stroke='%23000000'%20stroke-linecap='round'%20stroke-width='1.5'%20d='m%2069.849996,2.3151002%20a%201.0583333,1.0583333%200%200%200%20-0.85196,1.6880504%201.7145,1.7145%200%200%200%20-0.23019,2.8178099%20c%20-0.79375,0.28046%20-1.96056,1.46844%20-1.96056,3.5639395%20h%206.08542%20c%200,-2.0954995%20-1.16681,-3.2834795%20-1.96056,-3.5639395%20a%201.7092083,1.7092083%200%200%200%20-0.23019,-2.8178099%201.0609792,1.0609792%200%200%200%20-0.85196,-1.6880504%20z'%20id='path1-0'%20style='stroke-width:0.396875;stroke-dasharray:none'%20/%3e%3cg%20fill='none'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g6'%20transform='matrix(0.26458333,0,0,0.26458333,51.241617,0.31401259)'%3e%3cpath%20stroke-linejoin='miter'%20d='M%2022.5,11.6%20V%206'%20id='path1-36'%20/%3e%3cpath%20fill='%23000000'%20stroke-linecap='butt'%20stroke-linejoin='miter'%20d='m%2022.5,25%20c%200,0%204.5,-7.5%203,-10.5%200,0%20-1,-2.5%20-3,-2.5%20-2,0%20-3,2.5%20-3,2.5%20-1.5,3%203,10.5%203,10.5'%20id='path2-1'%20/%3e%3cpath%20fill='%23000000'%20d='m%2011.5,37%20a%2022.3,22.3%200%200%200%2021,0%20v%20-7%20c%200,0%209,-4.5%206,-10.5%20-4,-6.5%20-13.5,-3.5%20-16,4%20V%2027%2023.5%20C%2019,16%209.5,13%206.5,19.5%20c%20-3,6%205,10%205,10%20z'%20id='path3-0'%20/%3e%3cpath%20stroke-linejoin='miter'%20d='m%2020,8%20h%205'%20id='path4-6'%20/%3e%3cpath%20stroke='%23ececec'%20d='m%2032,29.5%20c%200,0%208.5,-4%206,-9.7%20C%2034.1,14%2025,18%2022.5,24.6%20v%202.1%20-2.1%20C%2020,18%209.9,14%207,19.9%20c%20-2.5,5.6%204.8,9%204.8,9'%20id='path5-3'%20/%3e%3cpath%20stroke='%23ececec'%20d='m%2011.5,30%20c%205.5,-3%2015.5,-3%2021,0%20m%20-21,3.5%20c%205.5,-3%2015.5,-3%2021,0%20m%20-21,3.5%20c%205.5,-3%2015.5,-3%2021,0'%20id='path6-2'%20/%3e%3c/g%3e%3cg%20fill='none'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g4-0'%20transform='matrix(0.26458333,0,0,0.26458333,13.225296,0.26458331)'%3e%3cpath%20fill='%23000000'%20d='m%2022,10%20c%2010.5,1%2016.5,8%2016,29%20H%2015%20c%200,-9%2010,-6.5%208,-21'%20id='path1-61'%20/%3e%3cpath%20fill='%23000000'%20d='m%2024,18%20c%200.38,2.91%20-5.55,7.37%20-8,9%20-3,2%20-2.82,4.34%20-5,4%20-1.04,-0.94%201.41,-3.04%200,-3%20-1,0%200.19,1.23%20-1,2%20-1,0%20-4,1%20-4,-4%200,-2%206,-12%206,-12%200,0%201.89,-1.9%202,-3.5%20-0.73,-1%20-0.5,-2%20-0.5,-3%201,-1%203,2.5%203,2.5%20h%202%20c%200,0%200.78,-2%202.5,-3%201,0%201,3%201,3'%20id='path2-5'%20/%3e%3cpath%20fill='%23ececec'%20stroke='%23ececec'%20d='m%209.5,25.5%20a%200.5,0.5%200%201%201%20-1,0%200.5,0.5%200%201%201%201,0%20m%205.43,-9.75%20a%200.5,1.5%2030%201%201%20-0.86,-0.5%200.5,1.5%2030%201%201%200.86,0.5'%20id='path3-5'%20/%3e%3cpath%20fill='%23ececec'%20stroke='none'%20d='M%2024.55,10.4%2024.1,11.85%2024.6,12%20c%203.15,1%205.65,2.49%207.9,6.75%202.25,4.26%203.25,10.31%202.75,20.25%20l%20-0.05,0.5%20h%202.25%20L%2037.5,39%20C%2038,28.94%2036.62,22.15%2034.25,17.66%2031.88,13.17%2028.46,11.02%2025.06,10.5%20Z'%20id='path4-4'%20/%3e%3c/g%3e%3cg%20fill='none'%20fill-rule='evenodd'%20stroke='%23000000'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='1.5'%20id='g4-76'%20transform='matrix(0.26458333,0,0,0.26458333,25.796875,0.48554898)'%3e%3cg%20fill='%23000000'%20stroke-linecap='butt'%20id='g3-5'%3e%3cpath%20d='m%209,36%20c%203.4,-1%2010.1,0.4%2013.5,-2%203.4,2.4%2010.1,1%2013.5,2%200,0%201.6,0.5%203,2%20-0.7,1%20-1.6,1%20-3,0.5%20-3.4,-1%20-10.1,0.5%20-13.5,-1%20C%2019.1,39%2012.4,37.5%209,38.5%207.6,39%206.7,39%206,38%207.4,36%209,36%209,36%20Z'%20id='path1-69'%20/%3e%3cpath%20d='m%2015,32%20c%202.5,2.5%2012.5,2.5%2015,0%200.5,-1.5%200,-2%200,-2%200,-2.5%20-2.5,-4%20-2.5,-4%205.5,-1.5%206,-11.5%20-5,-15.5%20-11,4%20-10.5,14%20-5,15.5%200,0%20-2.5,1.5%20-2.5,4%200,0%20-0.5,0.5%200,2%20z'%20id='path2-37'%20/%3e%3cpath%20d='m%2025,8%20a%202.5,2.5%200%201%201%20-5,0%202.5,2.5%200%201%201%205,0%20z'%20id='path3-4'%20/%3e%3c/g%3e%3cpath%20stroke='%23ececec'%20stroke-linejoin='miter'%20d='m%2017.5,26%20h%2010%20M%2015,30%20H%2030%20M%2022.5,15.5%20v%205%20M%2020,18%20h%205'%20id='path4-52'%20/%3e%3c/g%3e%3c/g%3e%3c/svg%3e";
//#endregion
//#region src/assets/images/buttons.svg?inline
var buttons_default = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Created%20with%20Inkscape%20(http://www.inkscape.org/)%20--%3e%3csvg%20width='240'%20height='120'%20viewBox='0%200%2063.5%2031.75'%20version='1.1'%20id='svg1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:svg='http://www.w3.org/2000/svg'%3e%3cdefs%20id='defs1'%20/%3e%3cg%20id='layer1'%3e%3cpath%20style='fill:none;stroke:%23000000;stroke-width:1.32292;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2021.702773,3.0515164%204.960585,4.1579463%20a%200.94996264,0.94996264%2090.000001%200%201%200,1.4560743%20l%20-4.960585,4.157946'%20id='path5'%20/%3e%3cpath%20style='fill:none;stroke:%23000000;stroke-width:1.32292;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2010.047226,3.0515136%20-4.9480105,4.14741%20a%200.96371341,0.96371341%2089.999996%200%200%201e-7,1.4771507%20l%204.9480104,4.1474087'%20id='path5-8'%20/%3e%3cpath%20id='rect6'%20style='fill:none;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none'%20d='m%2034.925003,5.0270832%20c%200,-1.0260542%200.826029,-1.8520833%201.852083,-1.8520833%20h%206.01927%20c%201.026055,0%201.852084,0.8260291%201.852084,1.8520833%20v%203.0096352%20m%200,3.0096356%20c%200,1.026054%20-0.826029,1.852084%20-1.852084,1.852084%20h%20-6.01927%20c%20-1.026054,0%20-1.852083,-0.82603%20-1.852083,-1.852084%20V%208.0367184'%20/%3e%3cpath%20id='rect7'%20style='fill:none;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none'%20d='m%2033.096357,8.9510327%201.828646,-1.8286456%201.828646,1.828646'%20/%3e%3cpath%20id='rect7-1'%20style='fill:none;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none'%20d='M%2046.477085,7.1224041%2044.648439,8.9510497%2042.819793,7.1224037'%20/%3e%3ccircle%20style='fill:none;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20id='path8'%20cx='55.5625'%20cy='7.9375'%20r='5.1593747'%20/%3e%3cpath%20style='fill:none;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2055.550662,6.8521225%20c%200,0%20-1.715897,3.0168048%20-0.967544,3.6014565%200.748355,0.584652%201.91766,-0.5144935%201.91766,-0.5144935'%20id='path9'%20/%3e%3ccircle%20style='fill:%23000000;fill-opacity:1;stroke:none;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20id='path10'%20cx='56.076847'%20cy='5.0163145'%20r='0.71327555'%20/%3e%3cpath%20style='fill:none;fill-opacity:1;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='M%203.88209,29.390346%20V%2019.100469%20c%200,0%202.0935254,0.751477%203.4037724,0.684157%200.9103112,-0.04677%201.7424921,-0.584729%202.691355,-0.65481%201.2665196,-0.09354%202.1768316,0.187089%202.1768316,0.187089%20l%20-0.07915,5.19171%20c%200,0%20-0.792616,-0.313496%20-1.781045,-0.233861%20-1.1905205,0.09592%20-2.3351455,0.514494%20-3.1267205,0.561266%20-1.1865396,0.07011%20-3.2454574,-0.327405%20-3.2454574,-0.327405'%20id='path11'%20/%3e%3cpath%20style='fill:none;fill-opacity:1;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='M%2019.097717,28.750209%2028.83504,19.012886'%20id='path13'%20/%3e%3cpath%20style='fill:none;fill-opacity:1;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2020.075261,19.810677%200.959114,-1.157552%20v%203.538802'%20id='path15'%20/%3e%3cpath%20style='fill:none;fill-opacity:1;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2025.565365,25.631509%20c%200,0%200.03752,-0.901983%201.157552,-0.959114%201.163574,-0.05935%201.176997,0.688062%201.02526,1.025261%20-0.297652,0.661458%20-2.116667,2.645833%20-2.116667,2.645833%20h%202.116667'%20id='path16'%20/%3e%3cpath%20style='fill:none;fill-opacity:1;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2036.947257,22.959626%20-1.5875,-2.116667%201.5875,-2.116667'%20id='path17'%20/%3e%3cpath%20style='fill:none;fill-opacity:1;stroke:%23000000;stroke-width:1.05833;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1'%20d='m%2034.751719,21.310681%20h%206.749225%20a%201.3891333,1.3891333%2045%200%201%201.389133,1.389133%20v%204.367238%20a%201.4639687,1.4639687%20135%200%201%20-1.463969,1.463969%20l%20-6.060842,0'%20id='path18'%20transform='translate(0.60803818,-0.46772167)'%20/%3e%3c/g%3e%3c/svg%3e";
//#endregion
//#region src/ui.js
console.log(pieces_default);
var BISHOPS_URL = "";
/**
* This event is fired when the user requests to
* move a piece.
*/
var MovePieceEvent = class extends Event {
	constructor(move) {
		super("movepiece", {
			bubbles: false,
			cancelable: false,
			composed: false
		});
		this.move = move;
	}
	/**
	* The selected `Move`.
	* @type {Move}
	*/
	move = null;
};
/**
* This class represents a visual HTML
* interface for chess games. Can be instantiated
* using the custom element (`<chess-ui>`) or using the
* constructor via JS (`new ChessUI()`).
*/
var ChessUI = class extends HTMLElement {
	/**
	* Using the constructor
	* is the recommended and most complete way to create
	* a `ChessUI` instance.
	* 
	* @overload
	* @param {Object} [options] - One or more options to set
	* as attributes, including `src`, `width`, `height`, `style`
	* or `template`.
	* @overload
	* @param {Game} game - A `Game` instance that will be automatically
	* rendered. It is possible to use the same `Game` instance in different
	* `ChessUI` elements.
	* @param {Object} [options] - One or more options to set
	* as attributes, including `src`, `width`, `height`, `style`
	* or `template`.
	* @overload
	* @param {string} srcOrPGN - A string representing a PGN text or a source
	* value pointing to a PGN resource. If it is a source attribute, it must start
	* with a dot (`.`) or a slash (`/`) to avoid confussion with PGN text.
	* @param {Object} [options] - One or more options to set
	* as attributes, including `src`, `width`, `height`, `style`
	* or `template`.
	* @overload
	* @param {string} fen - A valid FEN string to start the game.
	* @param {Object} [options] - One or more options to set
	* as attributes, including `src`, `width`, `height`, `style`
	* or `template`.
	*/
	constructor(...args) {
		super();
		if (args.length) {
			if (args[0] instanceof Game) {
				element.game = args[0];
				args.pop();
			} else if (typeof args[0] == "string") {
				this.game = new Game();
				if (/^(?:(?:[prnbqkPRNBQK1-8]{1,8}\/){7}[prnbqkPRNBQK1-8]{1,8})\s(?:w|b)\s(?:K?Q?k?q?|-)\s(?:-|[a-h][1-8])\s(?:[0-9]+)\s(?:[1-9][0-9]*)$/.exec(args[0])) {
					this.game.begin(args[0]);
					this.gameIsReady = true;
				} else if (args[0].startsWith("http") || args[0].startsWith(".") || args[0].startsWith("/")) this.src = args[0];
				else {
					this.game.begin();
					this.game.pgn.import(args[0]);
					this.gameIsReady = true;
				}
				args.pop();
			}
			if (args[0] instanceof Object) for (const key in args[0]) this.setAttribute(key, args[0][key]);
		} else {
			this.game = new Game();
			this.game.begin();
		}
		this.attachShadow({ mode: "open" });
	}
	/**
	* @readonly
	* The last position rendered. `-1` means the initial position, others
	* represent indices of the Game object.
	*/
	lastRendered = -1;
	/**
	* The source of a PGN file (similar to the `Image` `src` property and
	* attribute). The file is automatically fetched upon the next render
	* call and displayed when the fetch finishes, taking precedence over the
	* `pgn` attribute or the `Game` internal data.
	* 
	* Setting it to `null` will simply do nothing (if a game was already fetched or was
	* being fetched, it 
	* will not reset to the default value).
	* 
	* Directly correlated with the `src` attribute (when one changes,
	* the other is simultaneously modified). `null` means that nothing will be
	* fetched.
	* @type {string}
	*/
	get src() {
		return this.getAttribute("src");
	}
	set src(val) {
		this.setAttribute("src", val);
	}
	/**
	* True if the player bar, containing player names and clock data,
	* should be displayed. Connected to the `playerbar` HTML attribute.
	* @type {boolean}
	*/
	get showPlayerBar() {
		return this.getAttribute("playerbar") !== null;
	}
	set showPlayerBar(val) {
		if (val) this.setAttribute("playerbar", "");
		else this.removeAttribute("playerbar");
	}
	/**
	* If activated, when the client selects a piece in the playing
	* side, all possible moves for that piece will be displayed
	* on the board. The user may then select a move and an event
	* will be dispatched.
	* Possible values are:
	* * absent or nothing: Moves will not be displayed for neither
	* of the sides.
	* * `white`: Moves for the white pieces will be displayed.
	* * `black`: Moves for the black pieces will be displayed.
	* * `white black`, `black white` (or any other text value):
	* Moves for pieces of both colors will be displayed in their 
	* respective turns.
	* @type {string}
	*/
	get showMoves() {
		return this.getAttribute("showmoves");
	}
	set showMoves(val) {
		this.setAttribute("showmoves", val);
	}
	#fetched = null;
	#pgn = "";
	rootDiv = null;
	displayingMoves = null;
	/**
	* The template of the `ChessUI` element.
	* 
	* Possible values are: `classic`, `modern-light`, `modern-dark`.
	* A value of `null` is set to `modern-dark` by default.
	* 
	* Correlated with the `template` attribute: when one changes,
	* the other is simultaneously modified.
	* @type {'classic' | 'modern-light' | 'modern-dark' | null}
	*/
	get template() {
		return this.getAttribute("template");
	}
	set template(val) {
		this.setAttribute("template", val);
	}
	/**
	* The width of the frame in pixels.
	* Linked to the `width` attribute.
	* @type {number}
	*/
	get width() {
		return +this.getAttribute("width");
	}
	set width(v) {
		this.setAttribute("width", v);
	}
	/**
	* The height of the frame in pixels.
	* Linked to the `height` attribute.
	* @type {number}
	*/
	get height() {
		return +this.getAttribute("height");
	}
	set height(v) {
		this.setAttribute("height", v);
	}
	get rotateBoard() {
		return this.getAttribute("rotate") !== null;
	}
	set rotateBoard(val) {
		if (val) this.setAttribute("rotate", "");
		else this.removeAttribute("rotate");
	}
	/**
	* The loaded PGN text. Changing it will load the written PGN text,
	* modifying the internal `Game` upon the next render.
	* 
	* If both a PGN text and a source are set at the same time,
	* the PGN text will
	* be loaded first, but the source text will take precedence
	* when loaded.
	* 
	* If a Game was loaded manually before setting the `pgn` attribute,
	* the `pgn` attribute will preceed.
	* 
	* Directly related with the `textContent` property. When one changes,
	* the other is automatically modified.
	* @type {string}
	*/
	get pgn() {
		return this.textContent;
	}
	set pgn(val) {
		this.textContent = val;
	}
	gameIsReady = false;
	renderIsReady = false;
	static get observedAttributes() {
		return [
			"showmoves",
			"playerbar",
			"rotate",
			"template",
			"src",
			"width",
			"height"
		];
	}
	attributeChangedCallback(name, oldValue, newValue) {
		console.log(name);
		if (name !== "src") {
			if (oldValue !== newValue) this.render();
		}
	}
	connectedCallback() {
		this.renderIsReady = true;
		this.rootDiv = document.createElement("div");
		this.rootDiv.classList.add("chess-ui-main-container");
		this.styleElem = document.createElement("style");
		this.infoWrapper = document.createElement("div");
		this.infoWrapper.classList.add("chess-ui-info-wrapper");
		this.rootDiv.appendChild(this.infoWrapper);
		this.infoDiv = document.createElement("div");
		this.infoDiv.classList.add("chess-ui-info");
		this.infoWrapper.appendChild(this.infoDiv);
		this.infoWrapper.classList.add("chess-ui-info-wrapper-hidden");
		this.infoWrapper.onclick = () => {
			this.infoWrapper.classList.add("chess-ui-info-wrapper-hidden");
		};
		this.infoDiv.onclick = (e) => {
			e.stopPropagation();
		};
		this.infoWrapper.onkeydown = (e) => {
			if (e.key == "Escape" || e.key == "Space") this.infoWrapper.classList.add("chess-ui-info-wrapper-hidden");
			e.stopPropagation();
		};
		this.infoDiv.tabIndex = 1;
		this.infoList = document.createElement("ul");
		this.infoList.classList.add("chess-ui-info-list");
		this.infoDiv.appendChild(this.infoList);
		this.boardWrapperDiv = document.createElement("div");
		this.boardWrapperDiv.classList.add("chess-ui-board-wrapper");
		this.boardDiv = document.createElement("div");
		this.boardDiv.classList.add("chess-ui-board");
		this.boardWrapperDiv.appendChild(this.boardDiv);
		this.boardUnderlay = document.createElement("div");
		this.boardUnderlay.classList.add("chess-ui-board-underlay");
		for (let n = 0; n < 64; n++) {
			const square = document.createElement("button");
			square.tabIndex = -1;
			if (n % 2 == Math.floor(n / 8) % 2) square.classList.add("chess-ui-white-square");
			else square.classList.add("chess-ui-black-square");
			this.boardUnderlay.appendChild(square);
		}
		this.boardOverlay = document.createElement("div");
		this.boardOverlay.classList.add("chess-ui-board-overlay");
		this.menuDiv = document.createElement("div");
		this.menuDiv.classList.add("chess-ui-side-panel-wrapper");
		this.pgnContainerDiv = document.createElement("div");
		this.pgnContainerDiv.classList.add("chess-ui-pgn-container");
		this.gameControlDiv = document.createElement("div");
		this.gameControlDiv.classList.add("chess-ui-game-control");
		{
			const names = [
				"forward",
				"backward",
				"rotate",
				"info"
			];
			const callbacks = [
				() => {
					if (this.lastRendered >= 0) {
						this.renderPosition(this.lastRendered - 1);
						if (this.lastRendered !== -1) {
							const m = this.game.getMoveAt(this.lastRendered);
							if (m._random) {
								const item = this.pgnContainerDiv.querySelector(".chess-ui-pgn-cell-" + m._random);
								if (item) item.focus();
							}
						}
					}
				},
				() => {
					if (this.lastRendered + 1 < this.game.moveCount) {
						this.renderPosition(this.lastRendered + 1);
						if (this.lastRendered !== -1) {
							const m = this.game.getMoveAt(this.lastRendered);
							if (m._random) {
								const item = this.pgnContainerDiv.querySelector(".chess-ui-pgn-cell-" + m._random);
								if (item) item.focus();
							}
						}
					}
				},
				() => {
					this.rotateBoard = !this.rotateBoard;
				},
				() => {
					this.infoWrapper.classList.remove("chess-ui-info-wrapper-hidden");
					this.infoDiv.focus();
				}
			];
			this.buttons = [];
			for (let n = 0; n < 4; n++) {
				const button = document.createElement("button");
				button.classList.add("chess-ui-game-control-button", "chess-ui-" + names[n] + "button");
				button.onclick = callbacks[n];
				const icon = document.createElement("div");
				icon.classList.add("chess-ui-game-control-button-icon");
				icon.style.maskPosition = "-" + n + "00% 0";
				button.appendChild(icon);
				this.gameControlDiv.appendChild(button);
				this.buttons.push(button);
			}
		}
		this.menuDiv.appendChild(this.pgnContainerDiv);
		this.menuDiv.appendChild(this.gameControlDiv);
		this.boardDiv.appendChild(this.boardOverlay);
		this.boardDiv.appendChild(this.boardUnderlay);
		this.rootDiv.classList.add("chess-ui-display-player-bar");
		this.player1barWrapper = document.createElement("div");
		this.player2barWrapper = document.createElement("div");
		this.player1barWrapper.classList.add("chess-ui-player1-bar");
		this.player2barWrapper.classList.add("chess-ui-player2-bar");
		for (const bar of [this.player1barWrapper, this.player2barWrapper]) {
			const clock = document.createElement("div");
			clock.classList.add("chess-ui-player-bar-clock");
			clock.classList.add("chess-ui-" + (bar == this.player1barWrapper ? "black" : "white") + "-clock");
			const player = document.createElement("div");
			player.classList.add("chess-ui-player-bar-name");
			player.textContent = "Player";
			bar.appendChild(clock);
			bar.appendChild(player);
		}
		this.rootDiv.appendChild(this.player1barWrapper);
		this.rootDiv.appendChild(this.player2barWrapper);
		this.choosePromotionOverlayWrapper = document.createElement("div");
		this.choosePromotionOverlayWrapper.classList.add("chess-ui-choose-promotion-overlay-wrapper", "chess-ui-hidden");
		this.choosePromotionList = document.createElement("div");
		this.choosePromotionList.classList.add("chess-ui-choose-promotion-list");
		this.choosePromotionOverlayWrapper.appendChild(this.choosePromotionList);
		this.rootDiv.appendChild(this.boardWrapperDiv);
		this.rootDiv.appendChild(this.menuDiv);
		this.rootDiv.appendChild(this.choosePromotionOverlayWrapper);
		this.shadowRoot.innerHTML = "";
		this.shadowRoot.appendChild(this.styleElem);
		this.shadowRoot.appendChild(this.rootDiv);
		this.rootDiv.addEventListener("keydown", (e) => {
			if (e.key == "f") {
				this.rotateBoard = !this.rotateBoard;
				e.preventDefault();
				return;
			} else if (e.key == "ArrowDown" || e.key == "ArrowRight") {
				console.log(this.lastRendered, this.game.moveCount);
				if (this.lastRendered + 1 < this.game.moveCount) this.renderPosition(this.lastRendered + 1);
				e.preventDefault();
			} else if (e.key == "ArrowUp" || e.key == "ArrowLeft") {
				if (this.lastRendered >= 0) this.renderPosition(this.lastRendered - 1);
				e.preventDefault();
			} else return;
			this.game.useBranch(this.game.getBranchAt(this.lastRendered));
			if (this.lastRendered !== -1) {
				const m = this.game.getMoveAt(this.lastRendered);
				if (m._random) {
					const item = this.pgnContainerDiv.querySelector(".chess-ui-pgn-cell-" + m._random);
					if (item) item.focus();
				}
			}
		});
		this.boardWrapperDiv.addEventListener("wheel", (e) => {
			console.log(e.deltaY);
			let dy = e.deltaY;
			if (dy <= -1) {
				console.log(this.lastRendered, this.game.moveCount);
				if (this.lastRendered + 1 < this.game.moveCount) {
					this.renderPosition(this.lastRendered + 1);
					e.preventDefault();
				}
			} else if (dy >= 1) {
				if (this.lastRendered >= 0) {
					this.renderPosition(this.lastRendered - 1);
					e.preventDefault();
				}
			}
			this.game.useBranch(this.game.getBranchAt(this.lastRendered));
			if (this.lastRendered !== -1) {
				const m = this.game.getMoveAt(this.lastRendered);
				if (m._random) {
					const item = this.pgnContainerDiv.querySelector(".chess-ui-pgn-cell-" + m._random);
					if (item) item.focus();
				}
			}
		});
		this.rootDiv.tabIndex = 0;
		this.boardWrapperDiv.addEventListener("mousemove", (e) => {
			const cr = this.boardWrapperDiv.getBoundingClientRect();
			if (this.boardSelectedPiece) {
				console.log(e.clientY, e.clientX);
				this.boardSelectedPiece.style.transition = "initial";
				this.boardSelectedPiece.style.marginTop = e.clientY - cr.top - cr.height / 16 + "px";
				this.boardSelectedPiece.style.marginLeft = e.clientX - cr.left - cr.width / 16 + "px";
			}
		});
		this.render();
	}
	/**
	* Re-renders the whole UI, including orientation, player metadata,
	* position and PGN visualizer. It does also fetch newly set resources.
	* 
	* Must be called every time a significant change is made.
	* @returns 
	*/
	render() {
		if (!this.renderIsReady) return;
		if (this.src && this.src != this.#fetched) {
			this.gameIsReady = false;
			this.lastRendered = -1;
			this.#fetched = this.src;
			fetch(this.src).then((res) => res.text()).then((pgn) => {
				this.pgn = this.#pgn = pgn;
				this.game.pgn.import(pgn);
				this.gameIsReady = true;
				this.render();
			});
		}
		if (this.#pgn !== this.pgn) {
			this.game.pgn.import(this.pgn);
			this.#pgn = this.pgn;
		}
		switch (this.template) {
			case "classic":
				this.styleElem.innerHTML = core_default + classic_default;
				break;
			case "modern-light":
				this.styleElem.innerHTML = core_default + modern_light_default;
				break;
			default: this.styleElem.innerHTML = core_default + modern_dark_default;
		}
		this.styleElem.innerHTML += `
        .chess-ui-piece, .chess-ui-promotion-choice {
            background-image: url("${pieces_default}")
        }
        .chess-ui-game-control-button-icon {
            mask-image: url("${buttons_default}")
        }
        `;
		if (this.getAttribute("width")) this.style.width = this.getAttribute("width") + "px";
		if (this.getAttribute("height")) this.style.height = this.getAttribute("height") + "px";
		if (this.showPlayerBar) this.rootDiv.classList.add("chess-ui-display-player-bar");
		else this.rootDiv.classList.remove("chess-ui-display-player-bar");
		if (this.gameIsReady) {
			this.renderPosition(this.lastRendered);
			this.renderPGNText();
			this.renderMetadata();
			this.renderTimeMetadata();
		}
	}
	/**
	* Re-renders the time metadata.
	* @returns 
	*/
	renderTimeMetadata() {
		if (!this.player1barWrapper) return;
		this.player1barWrapper.children[0].classList.remove("chess-ui-selected");
		this.player2barWrapper.children[0].classList.remove("chess-ui-selected");
		console.log(this.lastRendered);
		const pos = this.lastRendered == -1 ? this.game.initialPosition : this.game.getPositionAt(this.lastRendered);
		if (!pos.turn == this.rotateBoard) this.player1barWrapper.children[0].classList.add("chess-ui-selected");
		else this.player2barWrapper.children[0].classList.add("chess-ui-selected");
		this.player1barWrapper.children[0].classList.remove("chess-ui-black-clock", "chess-ui-white-clock");
		this.player2barWrapper.children[0].classList.remove("chess-ui-black-clock", "chess-ui-white-clock");
		if (!this.rotateBoard) {
			this.player2barWrapper.children[0].classList.add("chess-ui-white-clock");
			this.player1barWrapper.children[0].classList.add("chess-ui-black-clock");
		} else {
			this.player1barWrapper.children[0].classList.add("chess-ui-white-clock");
			this.player2barWrapper.children[0].classList.add("chess-ui-black-clock");
		}
		if (this.game.timeControl && this.game.timeControl !== "-") {
			this.player1barWrapper.children[0].classList.add("chess-ui-display-clock");
			this.player2barWrapper.children[0].classList.add("chess-ui-display-clock");
			console.log(this.game.timeControl);
			if (this.lastRendered == -1) {
				const initialTime = this.game.timeControl.split("+")[0];
				if (+initialTime == initialTime) this.player1barWrapper.children[0].textContent = this.player2barWrapper.children[0].textContent = (/* @__PURE__ */ new Date(+initialTime * 1e3)).toISOString().split("T")[1].substring(0, 8);
			} else {
				let whiteClock = null, blackClock = null;
				if (!pos.turn) {
					blackClock = pos.move.clock;
					if (this.lastRendered == 0) whiteClock = +this.game.timeControl.split("+")[0] * 1e3;
					else whiteClock = this.game.getMoveAt(this.lastRendered - 1).clock;
				} else {
					whiteClock = pos.move.clock;
					if (this.lastRendered == 0) blackClock = +this.game.timeControl.split("+")[0] * 1e3;
					else blackClock = this.game.getMoveAt(this.lastRendered - 1).clock;
				}
				if (blackClock !== null && whiteClock !== null) {
					whiteClock = new Date(whiteClock).toISOString().split("T")[1].substring(0, 8);
					blackClock = new Date(blackClock).toISOString().split("T")[1].substring(0, 8);
					this.player1barWrapper.children[0].textContent = this.rotateBoard ? whiteClock : blackClock;
					this.player2barWrapper.children[0].textContent = this.rotateBoard ? blackClock : whiteClock;
				} else {
					const initialTime = this.game.timeControl.split("+")[0];
					this.player1barWrapper.children[0].textContent = this.player2barWrapper.children[0].textContent = (/* @__PURE__ */ new Date(+initialTime * 1e3)).toISOString().split("T")[1].substring(0, 8);
				}
			}
		} else {
			this.player1barWrapper.children[0].classList.remove("chess-ui-display-clock");
			this.player2barWrapper.children[0].classList.remove("chess-ui-display-clock");
		}
	}
	/**
	* Re-renders player names, Elo, titles and winner.
	* @returns 
	*/
	renderMetadata() {
		if (!this.player1barWrapper) return;
		this.player1barWrapper.children[1].innerHTML = this.player2barWrapper.children[1].innerHTML = "";
		const white = this.game.whiteName || "White";
		const black = this.game.blackName || "Black";
		const whiteElem = document.createElement("span");
		whiteElem.textContent = white;
		const blackElem = document.createElement("span");
		blackElem.textContent = black;
		let whiteTitle = null, blackTitle = null;
		let whiteResult = null, blackResult = null;
		if (this.game.whiteTitle) {
			whiteTitle = document.createElement("span");
			whiteTitle.classList.add("chess-ui-name-title");
			whiteTitle.textContent = this.game.whiteTitle + " ";
		}
		if (this.game.blackTitle) {
			blackTitle = document.createElement("span");
			blackTitle.classList.add("chess-ui-name-title");
			blackTitle.textContent = this.game.blackTitle + " ";
		}
		if (this.game.result) {
			whiteResult = document.createElement("span");
			blackResult = document.createElement("span");
			if (this.game.result == 1) {
				whiteResult.classList.add("chess-ui-name-result-winner");
				blackResult.classList.add("chess-ui-name-result-loser");
				whiteResult.textContent = " 1";
				blackResult.textContent = " 0";
			} else if (this.game.result == 2) {
				blackResult.classList.add("chess-ui-name-result-winner");
				whiteResult.classList.add("chess-ui-name-result-loser");
				blackResult.textContent = " 1";
				whiteResult.textContent = " 0";
			} else if (this.game.result == 3) {
				whiteResult.classList.add("chess-ui-name-result-draw");
				blackResult.classList.add("chess-ui-name-result-draw");
				blackResult.textContent = " ½";
				whiteResult.textContent = " ½";
			}
		}
		if (this.rotateBoard) {
			if (whiteTitle) this.player1barWrapper.children[1].appendChild(whiteTitle);
			if (blackTitle) this.player2barWrapper.children[1].appendChild(blackTitle);
			this.player1barWrapper.children[1].appendChild(whiteElem);
			this.player2barWrapper.children[1].appendChild(blackElem);
			if (whiteResult) this.player1barWrapper.children[1].appendChild(whiteResult);
			if (blackResult) this.player2barWrapper.children[1].appendChild(blackResult);
		} else {
			if (whiteTitle) this.player2barWrapper.children[1].appendChild(whiteTitle);
			if (blackTitle) this.player1barWrapper.children[1].appendChild(blackTitle);
			this.player1barWrapper.children[1].appendChild(blackElem);
			this.player2barWrapper.children[1].appendChild(whiteElem);
			if (whiteResult) this.player2barWrapper.children[1].appendChild(whiteResult);
			if (blackResult) this.player1barWrapper.children[1].appendChild(blackResult);
		}
		const whiteU = this.game.whiteName ?? "Unknown";
		const whiteNA = this.game.whiteNetworkAddress ? `<a target="_blank" href="${this.game.whiteNetworkAddress}">${whiteU}</a>` : whiteU;
		const blackU = this.game.blackName ?? "Unknown";
		const blackNA = this.game.blackNetworkAddress ? `<a target="_blank" href="${this.game.whiteNetworkAddress}">${blackU}</a>` : blackU;
		const titles = {
			"fm": "FIDE Master",
			"im": "International Master",
			"gm": "Grandmaster",
			"nm": "National Master",
			"cm": "Candidate Master",
			"wgm": "Woman Grandmaster",
			"wim": "Woman International Master",
			"wfm": "Woman FIDE Master",
			"wcm": "Woman Candidate Master"
		};
		const annotators = {
			"lichess.org": `<a href="https://lichess.org/" target="_blank">lichess.org</a>`,
			"bishops.js": `<a href="${BISHOPS_URL}" target="_blank">bishops.js</a>`
		};
		function isValidHttpUrl(string) {
			let url;
			try {
				url = new URL(string);
			} catch (_) {
				return false;
			}
			return url.protocol === "http:" || url.protocol === "https:";
		}
		this.infoList.innerHTML = `
        ${isValidHttpUrl(this.game.site) ? `<li><a target="_blank" href="${this.game.site}">${this.game.site}</a></li>` : this.game.site ? `<li>${this.game.site}</li>` : ""}
        <li>Event: ${this.game.event ?? "Unnamed"}</li>
        <li>Date: ${this.game.pgnDate ?? "????.??.??"}</li>
        ${this.game.round ? `<li>Round: ${this.game.round}</li>` : ""}
        <li>Annotator: ${annotators[this.game.annotator.toLowerCase()] ?? this.game.annotator ?? `Unknown`}</li>
        <li>White name: ${whiteNA}</li>
        <li>Black name: ${blackNA}</li>
        ${this.game.whiteElo ? `<li>White Elo: ${this.game.whiteElo}</li>` : ""}
        ${this.game.blackElo ? `<li>Black Elo: ${this.game.blackElo}</li>` : ""}
        ${this.game.whiteTitle ? `<li>White title: ${this.game.whiteTitle} ${titles[this.game.whiteTitle.toLowerCase()]}</li>` : ""}
        ${this.game.blackTitle ? `<li>Black title: ${this.game.blackTitle} ${titles[this.game.blackTitle.toLowerCase()]}</li>` : ""}
        ${this.game.timeControl ? `<li>Time control: ${this.game.timeControl}</li>` : ""}
        <li>Result: ${this.game.pgnResult.replace("*", "Unterminated")}</li>
        <br>
        <li><a target="_blank" href="${BISHOPS_URL}">Bishops.js</a></li>
        `;
	}
	/**
	* Re-renders all the PGN text. (Focus will be lost.)
	*/
	renderPGNText() {
		const t = this;
		const branch = this.game.mainBranch;
		function writeBranch(branch, container) {
			const sorted = branch.children.toSorted((a, b) => {
				return a.countStart - b.countStart;
			});
			let lastMove = null;
			for (const n in branch.moves) {
				const move = branch.moves[n];
				if (!move._random) move._random = Math.trunc(2 ** 32 * Math.random()).toString(16) + Math.trunc(2 ** 32 * Math.random()).toString(16) + Math.trunc(2 ** 32 * Math.random()).toString(16);
				if ((+n + branch.countStart) % 2 == 0) {
					if (lastMove) container.appendChild(lastMove);
					lastMove = document.createElement("div");
					lastMove.classList.add("chess-ui-pgn-row");
					const num = document.createElement("div");
					num.classList.add("chess-ui-pgn-number");
					num.textContent = Math.floor((+n + branch.countStart) / 2 + 1) + ". ";
					lastMove.appendChild(num);
				} else if (!lastMove) {
					lastMove = document.createElement("div");
					lastMove.classList.add("chess-ui-pgn-row");
					const num = document.createElement("div");
					num.classList.add("chess-ui-pgn-number");
					num.textContent = Math.floor((+n + branch.countStart) / 2 + 1) + "... ";
					lastMove.appendChild(num);
					lastMove.appendChild(document.createElement("span"));
				}
				const part = document.createElement("button");
				part.classList.add("chess-ui-pgn-cell");
				part.classList.add("chess-ui-pgn-cell-" + move._random);
				part.textContent = move.san;
				const o = +n + branch.countStart;
				const b = branch;
				part.addEventListener("click", () => {
					t.game.useBranch(b);
					t.renderPosition(o);
				});
				lastMove.appendChild(part);
				if (move.annotationGlyph && move.annotationGlyph <= 6) {
					part.textContent += [
						"!",
						"?",
						"!!",
						"??",
						"!?",
						"?!"
					][move.annotationGlyph - 1];
					part.classList.add("chess-ui-pgn-cell-nag" + move.annotationGlyph);
				}
				part.textContent += " ";
				if (move.comments?.length) {
					container.appendChild(lastMove);
					for (const n in move.comments) if (move.comments[n]) {
						const comment = document.createElement("div");
						comment.classList.add("chess-ui-pgn-comment");
						comment.textContent = move.comments[n];
						container.appendChild(comment);
					}
					lastMove = null;
				}
				while (true) if (sorted.length && +n + branch.countStart === sorted[0].countStart) {
					const variant = document.createElement("div");
					variant.classList.add("chess-ui-pgn-variant");
					writeBranch(sorted[0], variant);
					if (lastMove) container.appendChild(lastMove);
					container.appendChild(variant);
					lastMove = null;
					sorted.shift();
				} else break;
			}
			if (lastMove) container.appendChild(lastMove);
		}
		this.pgnContainerDiv.innerHTML = "";
		writeBranch(branch, this.pgnContainerDiv);
		if (this.game.result) {
			const result = document.createElement("div");
			result.textContent = [
				"1 - 0",
				"0 - 1",
				"½ - ½"
			][this.game.result - 1];
			result.classList.add("chess-ui-pgn-result");
			this.pgnContainerDiv.appendChild(result);
		}
	}
	/**
	* Displays all possible moves for a piece in a square `n`.
	* @param {*} n 
	*/
	selectPiece(n) {
		this.deselectAllPieces();
		if (!this.gameIsReady) return;
		const position = this.lastRendered == -1 ? this.game.initialPosition : this.game.getPositionAt(this.lastRendered);
		const turn = !!position.turn;
		if (!(turn && this.showMoves && this.showMoves.toLowerCase().trim() !== "white" || !turn && this.showMoves && this.showMoves.toLowerCase().trim() !== "black")) return;
		const piece = position.pieceAt(n);
		let pieceColor;
		if ("RNBQKP".indexOf(piece) !== -1) pieceColor = false;
		else pieceColor = true;
		console.log(pieceColor);
		if (pieceColor == turn) {
			let moves;
			if (this.lastRendered == this.game.moveCount - 1) moves = this.game.legalMoves();
			else {
				console.log("POSAT", this.game.getPositionAt(-1));
				moves = this.game.getPositionAt(this.lastRendered).legalMoves();
			}
			for (const move of moves) if (move.origin == n) {
				this.displayingMoves.push(move);
				const r = move.destination % 8;
				const f = Math.floor(move.destination / 8);
				const child = this.boardUnderlay.children[(7 - f) * 8 + r];
				if (!child.classList.contains("chess-ui-possible-move")) {
					child.classList.add("chess-ui-possible-move");
					if (position.pieceAt(f * 8 + r)) child.classList.add("chess-ui-possible-capture");
					child.onclick = () => {
						this.dispatchEvent(new MovePieceEvent(move));
					};
					child._moves = [move];
					child.tabIndex = 0;
				} else {
					child._moves.push(move);
					child.onclick = () => {
						this.renderPromotionRequest(child._moves);
						alert("Promotion request!");
						console.log(child._moves);
					};
				}
			}
		}
	}
	deselectAllPieces() {
		this.displayingMoves = [];
		for (const elem of this.boardUnderlay.querySelectorAll(".chess-ui-possible-move")) {
			elem._moves = null;
			elem.onclick = null;
			elem.tabIndex = -1;
			elem.classList.remove("chess-ui-possible-move", "chess-ui-possible-capture");
		}
	}
	/**
	* Renders a new position. This function does not set the focus automatically.
	* Moves (rendering from one position to the immediate next) will be detected and
	* applied automatically.
	* @param {number} n - The index of the position to render. Defaults to `-1`
	*/
	renderPosition(n = -1) {
		this.deselectAllPieces();
		console.log(n, this.lastRendered);
		let position;
		if (n == this.lastRendered + 1) position = this._renderMove();
		if (n != this.lastRendered + 1) {
			if (n == -1) position = this.game.initialPosition;
			else {
				position = this.game.getPositionAt(n);
				console.log(this.game.getBranchAt(n));
			}
			this.boardOverlay.innerHTML = "";
		}
		for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
			const p = position.pieceAt(r * 8 + f);
			if (p) {
				const type = "RNBQKP".indexOf(p.toUpperCase());
				const color = "RNBQKP".indexOf(p) == -1;
				const bgOffX = type * 100;
				const item = document.createElement("button");
				item.classList.add("chess-ui-piece", "chess-ui-" + (color ? "black" : "white"), "chess-ui-piece-" + numberToSquare(r * 8 + f), "chess-ui-piece-" + p);
				item.style.backgroundPositionX = -bgOffX + "%";
				item.style.backgroundPositionY = color ? "0" : "100%";
				item.style.marginTop = (this.rotateBoard ? r : 7 - r) * 12.5 + "%";
				item.style.marginLeft = (this.rotateBoard ? 7 - f : f) * 12.5 + "%";
				if (position.move?.destination === r * 8 + f && !position.move?.castling) {
					if (n == this.lastRendered + 1) continue;
					else item.classList.add("chess-ui-last-move");
				}
				if (position.move?.castling && n == this.lastRendered + 1) {
					const kingDest = position.turn ? position.move.castling == -1 ? 2 : 6 : position.move.castling == -1 ? 56 : 62;
					const rookDest = position.turn ? position.move.castling == -1 ? 3 : 5 : position.move.castling == -1 ? 57 : 61;
					if (r * 8 + f == kingDest && type == 4) continue;
					else if (r * 8 + f == rookDest && type == 0) continue;
				} else if (position.move?.castling && type == 4 && color == !position.turn) item.classList.add("chess-ui-last-move");
				if (position.turn == color && type == 4 && position.isCheck) {
					item.classList.add("chess-ui-king-check");
					item.classList.add("chess-ui-last-move");
				}
				if (color == position.turn) {
					console.log("TURN", position.turn ? "black" : "white", this.showMoves);
					if (position.turn && this.showMoves && this.showMoves.toLowerCase().trim() !== "white" || !position.turn && this.showMoves && this.showMoves.toLowerCase().trim() !== "black") {
						item.tabIndex = 0;
						item.onmousedown = () => {
							this.boardSelectedPiece = item;
							console.log(item);
						};
						item.onmouseup = (e) => {
							if (this.boardSelectedPiece == item) {
								const cr = this.boardWrapperDiv.getBoundingClientRect();
								this.boardSelectedPiece = null;
								item.style.transition = null;
								item.style.marginTop = (this.rotateBoard ? r : 7 - r) * 12.5 + "%";
								item.style.marginLeft = (this.rotateBoard ? 7 - f : f) * 12.5 + "%";
								const destinationX = Math.floor((e.clientX - cr.left) / (cr.width / 8));
								const destinationY = Math.floor((e.clientY - cr.top) / (cr.height / 8));
								const file = destinationX;
								const rank = 7 - destinationY;
								if (file !== f || rank !== r) {
									let moves;
									if (this.lastRendered == this.game.moveCount - 1) moves = this.game.legalMoves();
									else {
										console.log("POSAT", this.game.getPositionAt(-1));
										moves = this.game.getPositionAt(this.lastRendered).legalMoves();
									}
									console.log(moves);
									const d = file + rank * 8;
									const o = f + r * 8;
									const possible = [];
									for (const m of moves) {
										console.log(m.origin, o, m.destination, d);
										if (m.origin == o && (m.destination == d || m.kingDestination == d)) possible.push(m);
									}
									if (possible.length) {
										if (possible.length == 1) this.dispatchEvent(new MovePieceEvent(possible[0]));
										else this.renderPromotionRequest(possible);
									}
								}
							}
						};
						item.onclick = () => {
							if (this.boardUnderlay.children[(7 - r) * 8 + f].classList.contains("chess-ui-possible-move")) this.boardUnderlay.children[(7 - r) * 8 + f].click();
							else this.selectPiece(r * 8 + f);
						};
					}
				} else {
					item.tabIndex = -1;
					item.style.pointerEvents = "none";
				}
				this.boardOverlay.appendChild(item);
			}
		}
		this.lastRendered = n;
		this.renderTimeMetadata();
	}
	/**
	* 
	* @param {Move[]} moves 
	*/
	renderPromotionRequest(moves) {
		this.choosePromotionOverlayWrapper.classList.remove("chess-ui-hidden");
		this.choosePromotionOverlayWrapper.onclick = () => {
			this.choosePromotionOverlayWrapper.classList.add("chess-ui-hidden");
		};
		this.choosePromotionOverlayWrapper.onkeydown = (e) => {
			if (e.key == "Escape") this.choosePromotionOverlayWrapper.classList.add("chess-ui-hidden");
		};
		this.choosePromotionList.innerHTML = "";
		for (const move of moves) {
			const piece = move.promotion;
			const elem = document.createElement("button");
			elem.classList.add("chess-ui-promotion-choice");
			this.choosePromotionList.appendChild(elem);
			console.log(piece);
			if (piece) {
				const bgOffX = "RNBQKP".indexOf(piece) * 100;
				elem.style.backgroundPositionX = -bgOffX + "%";
				elem.style.backgroundPositionY = new PositionView(move, this.game).turn ? "100%" : "0%";
			}
			elem.onclick = () => {
				this.choosePromotionOverlayWrapper.classList.add("chess-ui-hidden");
				this.dispatchEvent(new MovePieceEvent(move));
			};
		}
	}
	_renderMove() {
		const n = this.lastRendered + 1;
		const position = this.game.getPositionAt(n);
		const dest = position.pieceAt(position.move.destination);
		let castlingKingDone, castlingRookDone;
		for (const item of [...this.boardOverlay.children]) {
			item.classList.remove("chess-ui-last-move");
			item.classList.remove("chess-ui-king-check");
			const classes = item.className.split(" ");
			let pos, piece, color;
			for (const c of classes) if (c.length == 17) pos = c.substring(c.length - 2);
			else if (c.length == 16) piece = c.substring(c.length - 1);
			else if (c == "chess-ui-black" || c == "chess-ui-white") color = c.substring(c.length - 5) == "black";
			let file, rank;
			if (position.move.castling) {
				if (color == !position.turn) {
					console.log("castling");
					if (piece.toLowerCase() == "k") {
						const kingDest = position.turn ? position.move.castling == -1 ? 2 : 6 : position.move.castling == -1 ? 56 : 62;
						const dest = position.pieceAt(kingDest);
						console.log(dest, piece);
						if (dest == piece) {
							file = Math.floor(kingDest / 8);
							rank = kingDest % 8;
							item.style.marginTop = (this.rotateBoard ? file : 7 - file) * 12.5 + "%";
							item.style.marginLeft = (this.rotateBoard ? 7 - rank : rank) * 12.5 + "%";
							item.classList.add("chess-ui-last-move");
							item.classList.remove("chess-ui-piece-" + pos);
							item.classList.add("chess-ui-piece-" + numberToSquare(file * 8 + rank));
							castlingKingDone = true;
						}
					} else if (piece.toLowerCase() == "r") {
						if (position.pieceAt(squareToNumber(pos)).toLowerCase() !== "r") {
							const rookDest = position.turn ? position.move.castling == -1 ? 3 : 5 : position.move.castling == -1 ? 57 : 61;
							if (position.pieceAt(rookDest) == piece) {
								file = Math.floor(rookDest / 8);
								rank = rookDest % 8;
								item.style.marginTop = (this.rotateBoard ? file : 7 - file) * 12.5 + "%";
								item.style.marginLeft = (this.rotateBoard ? 7 - rank : rank) * 12.5 + "%";
								item.classList.remove("chess-ui-piece-" + pos);
								item.classList.add("chess-ui-piece-" + numberToSquare(file * 8 + rank));
								castlingRookDone = true;
							}
						}
					}
				} else this.boardOverlay.removeChild(item);
			} else if (squareToNumber(pos) === position.move.origin && dest !== " ") {
				file = Math.floor(position.move.destination / 8);
				rank = position.move.destination % 8;
				const bgOffX = "RNBQKP".indexOf(dest.toUpperCase()) * 100;
				item.className = "";
				item.classList.add("chess-ui-piece", "chess-ui-" + (color ? "black" : "white"), "chess-ui-piece-" + numberToSquare(file * 8 + rank), "chess-ui-piece-" + dest);
				item.style.backgroundPositionX = -bgOffX + "%";
				item.style.backgroundPositionY = color ? "0" : "100%";
				item.style.marginTop = (this.rotateBoard ? file : 7 - file) * 12.5 + "%";
				item.style.marginLeft = (this.rotateBoard ? 7 - rank : rank) * 12.5 + "%";
				item.classList.add("chess-ui-last-move");
				item.classList.remove("chess-ui-piece-" + pos);
				item.classList.add("chess-ui-piece-" + numberToSquare(file * 8 + rank));
			} else this.boardOverlay.removeChild(item);
			item.tabIndex = -1;
			item.style.pointerEvents = "none";
		}
		if (position.move?.castling && (!castlingKingDone || !castlingRookDone)) {
			this.lastRendered = -2;
			return null;
		}
		return position;
	}
};
window.customElements.define("chess-ui", ChessUI);
//#endregion
export { ChessUI, MovePieceEvent };
