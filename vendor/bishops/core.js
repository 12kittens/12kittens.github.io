//#region src/core.js
var PIECES = " RNBQKPrnbqkp";
/**
* Takes a square (`a8`, `c3`) and returns its corresponding number
* starting from the bottom left (`a1`) square.
* @param {string} square - The input square.
* @returns {number} The corresponding number, starting from the `a1` square
* and counting from left to right, rank (file · 8 + rank)
*/
function squareToNumber(square) {
	const f = "abcdefgh".indexOf(square[0]);
	return (+square[1] - 1) * 8 + f;
}
/**
* Takes a square (`a8`, `c3`) and returns its corresponding number
* starting from the bottom left (`a1`) square.
* @param {string} square - The input square.
* @returns {number} The corresponding number, starting from the `a1` square
* and counting from left to right, rank (file · 8 + rank)
*/
var stn = squareToNumber;
/**
* Takes a number and returns the corresponding square of the board
* in SAN format (`a8`, `c3`)
* @param {number} number - The input square number in `file · 8 + rank` format.
* @returns {string} The corresponding square.
*/
function numberToSquare(number) {
	const r = Math.floor(number / 8);
	return "abcdefgh"[number % 8] + (r + 1);
}
/**
* Takes a number and returns the corresponding square of the board
* in SAN format (`a8`, `c3`)
* @param {number} number - The input square number in `file · 8 + rank` format.
* @returns {string} The corresponding square.
*/
var nts = numberToSquare;
/**
* A `Position` represents a 8x8 chess board with pieces on it.
* 
* It stores the position of the pieces and relevant data about
* the state of the game.
*/
var Position = class Position {
	/**
	* Builds an empty `Position`. This function takes no
	* arguments and starts with an empty position (no pieces).
	* The constructor is commonly used internally by `Game`s and
	* `Variant`s.
	*/
	constructor() {}
	_buffer = /* @__PURE__ */ new Uint8Array(32);
	_changed = true;
	_state = {};
	_pieces = 0;
	_hash = null;
	_whiteHasSufficientMaterial = null;
	_blackHasSufficientMaterial = null;
	/**
	* Clones the state and position from another `Position` instance to this one.
	* @param {Position} position - The `Position` to copy the data
	* from.
	* @returns {this} itself.
	*/
	from(position) {
		this._changed = true;
		this._buffer.set(position._buffer);
		this._state = structuredClone(position._state);
		this._pieces = position._pieces;
		return this;
	}
	/**
	* Sets the value of a chosen square to a number.
	* @param {number} index - The index of square to change.
	* @param {number} value - The numerical value of
	* the piece (if unsure, use `setPiece` instead).
	* @returns {this} itself.
	*/
	set(index, value) {
		const prev = this.at(index);
		if (prev === 0 && value !== 0) this._pieces++;
		else if (prev !== 0 && value === 0) this._pieces--;
		this._changed = true;
		if (value >= 16) return this;
		let mask = 15;
		if (index % 2 == 1) {
			value *= 16;
			mask = 240;
		}
		this._buffer[Math.floor(index / 2)] = this._buffer[Math.floor(index / 2)] & 255 - mask | value;
		return this;
	}
	/**
	* Gets the numerical value of a chosen square.
	* @param {number} index - The index of the square to read.
	* @returns {number} - The numerical value of the read square,
	* corresponding to a piece.
	*/
	at(index) {
		if (index % 2 == 1) return Math.floor(this._buffer[Math.floor(index / 2)] / 16);
		else return this._buffer[Math.floor(index / 2)] % 16;
	}
	/**
	* @readonly
	* (read-only)
	* Generates a unique hash for this position. Only positions
	* with the same hash may be considered similar. Used internally
	* for threefold and fivefold repetition checking.
	* @type {string}
	*/
	get hash() {
		if (this._changed) {
			this._hash = Position._decoder.decode(this._buffer) + String.fromCharCode([this._state.blackHasKingsideCastling << 0 + this._state.whiteHasKingsideCastling << 1 + this._state.blackHasQueensideCastling << 2 + this._state.whiteHasQueensideCastling << 3 + this._state.turn << 4 + !!this._state.enPassant << 5]);
			this._changed = false;
		}
		return this._hash;
	}
	/**
	* Gets the string value of a piece in a chosen tile. Lowercase letters
	* are used for black pieces, while uppercase letters correspond to
	* white pieces. An empty string represents an empty square.
	* @param {number | string} square - The index of the square to read, or the
	* square in human-readable format.
	* @returns {string} A single-character string, representing the piece
	* contained by the square. For empty squares, an empty string is returned.
	*/
	pieceAt(square) {
		if (typeof square === "string") square = squareToNumber(square);
		const v = this.at(square);
		return v ? PIECES[v] : "";
	}
	/**
	* Sets a piece in a chosen square. 
	* @param {number | string} square - The index of the square to read, or the
	* square in human-readable format.
	* @param {string | null} value - The piece to set, as a string. Use an empty string
	* or a nullable value for clearing a square. Use lowercase letters for black pieces
	* and uppercase letters for white pieces.
	* @returns {this} itself.
	*/
	setPiece(square, piece) {
		if (typeof square === "string") square = squareToNumber(square);
		if (!piece) {
			this.set(square, 0);
			return this;
		}
		if (piece.length > 1) return this;
		const value = PIECES.indexOf(piece);
		if (value == -1) return this;
		this.set(square, value);
		return this;
	}
	/**
	* Change properties of the internal state
	* of the position, based on an object.
	* @param {Object} state - The state properties to change, as an
	* object (`key`: `value`). Properties that are not included
	* won't be updated.
	* @returns {this} itself.
	*/
	setState(state) {
		this._changed = true;
		for (const key in state) this._state[key] = state[key];
		return this;
	}
	/**
	* Gets the real state of the `Position`. Any changes made
	* will affect the internal `Position`'s state.
	* @returns {Object} A reference to the internal state of this instance.
	*/
	state() {
		return this._state;
	}
	/**
	* Formats and prints this `Position` to the console. This function takes
	* no arguments.
	* ```
	* position.print()
	* ```
	*/
	print() {
		const args = ["\n"];
		for (let n = 0; n < 8; n++) {
			for (let m = 0; m < 8; m++) {
				const rankOffset = (7 - n) * 8;
				const piece = this.pieceAt(m + rankOffset);
				if (!piece) {
					if (args[0][args[0].length - 1] == "·") args[0] += " ·";
					else {
						args[0] += " %c·";
						args.push("color: #808080;");
					}
				} else if (args[0][args[0].length - 1] == "·") {
					args[0] += "%c " + piece;
					args.push("color: initial;");
				} else args[0] += " " + piece;
			}
			args[0] += "%c\n";
			args.push("color: initial;");
		}
		console.log(...args);
	}
	static _decoder = new TextDecoder();
};
/**
* Represents the transition from one position to another. It includes
* the SAN notation, the origin position, the destination position,
* the promotion piece and more.
* 
* It is constructed internally by `Variant`s.
*/
var Move = class {
	constructor(position, san, origin, destination, mode = 0, promotion = null, kingDest = null, rookDest = null) {
		this._position = position;
		this.san = san;
		this.origin = origin;
		this.destination = destination;
		this.mode = mode;
		this.promotion = promotion;
		this.kingDestination = kingDest;
		this.rookDestination = rookDest;
	}
	_position = null;
	_check = null;
	_checkmate = null;
	_stalemate = null;
	/**
	* @readonly
	* (Read-only)
	* Represents the SAN (Standard Algebraic Notation) notation of a movement.
	* It is generated by the `Variant`.
	* @type {string}
	*/
	san = null;
	/**
	* @readonly
	* (Read-only)
	* The index of the origin square of the movement, as a number.
	* @type {number}
	*/
	origin = null;
	/**
	* @readonly
	* (Read-only)
	* The index of the destination square of the movement, as a number.
	* By default, the castling destination movement is the previous rook position
	* (not necessarily the final king position)
	* @type {number}
	*/
	destination = null;
	/**
	* @readonly
	* (Read-only)
	* The index of the destination square of the king (for castling movements).
	* @type {number?}
	*/
	kingDestination = null;
	/**
	* @readonly
	* (Read-only)
	* The index of the destination square of the rook (for castling movements).
	* @type {number?}
	*/
	rookDestination = null;
	/**
	* @readonly
	* (Read-only)
	* The move mode. 
	* 
	* 0. **normal**: includes normal moves and castlings.
	* 1. **capture**: a piece captures another. In Atomic, this includes
	* an explosion. A checkmate caused by a capture is also a capture.
	* 2. **drop**: (Crazyhouse and custom) a captured piece is sent
	* again to the board (reserved for future implementation).
	* @type {number}
	*/
	mode = null;
	/**
	* @readonly
	* (Read-only)
	* The promotion piece. It is a string representing a piece type, always
	* uppercase: 'Q', 'R', 'B', 'N', 'K' (Suicide and custom). `null` if
	* the piece doesn't promote.
	* @type {string | null}
	*/
	promotion = null;
	/**
	* @readonly
	* (Read-only) The chess move in UCI (Universal Chess Interface) format.
	* @type {string}
	*/
	get uci() {
		return numberToSquare(this.origin) + numberToSquare(this.destination) + promotion;
	}
	/**
	* @readonly
	* (Read-only) Returns -1 if the move is a queenside castling, 1 if the move
	* is a kingside castling and 0 otherwise.
	* @type {number}
	*/
	get castling() {
		if (this.san == "O-O") return 1;
		if (this.san == "O-O-O") return -1;
		return 0;
	}
	/**
	* @type {number}
	* The numeric annotation glyph (without the dollar sign)
	* according to the PGN standard codes. This can be a number
	* from 0 to 255, but the most common ones are:
	* 
	* * `0`: No notation.
	* * `1`: Good move (`!`)
	* * `2`: Poor move (`?`)
	* * `3`: Brilliant move (`!!`)
	* * `4`: Blunder (`??`)
	* * `5`: Speculative move (`!?`)
	* * `6`: Inaccuracy (`?!`)
	* 
	* The `Game.move()` method automatically sets this value from moves with
	* suffix annotations and translates them into NAGs. The `PGNParser` interface
	* also manages this codes automatically when importing.
	* 
	* Defaults to 0.
	* 
	* This property can be modified.
	*/
	annotationGlyph = 0;
	/**
	* An array of comments about this move, expressed as `string`s. This property
	* is set automatically from PGN data when importing, and is set manually when
	* exporting to PGN. `null` if unset.
	* 
	* This property can be modified.
	* @type {string[]}
	*/
	comments = [];
	/**
	* The time remaining when this move was completed, expressed in milliseconds.
	* This property is automatically set when importing from external PGN games
	* with clock notation and are included in exported PGN. `null` if unset.
	* 
	* This property can be modified.
	* @type {number}
	*/
	clock = null;
};
/**
* A `Variant` interprets and evaluates games according to
* a set of rules. Each game has a `Variant` which calls internally
* to evaluate if a move is legal or a game is over.
*/
var Variant = class {
	/**
	* Represents the position of the board when the game starts. For
	* some variants (like Chess960), this initial position might be random.
	* @param {Object} options - The engine uses this options internally
	* to decide the initial position.
	* @returns {Position} The start position with the initial game state.
	*/
	initial(options = {}) {}
	/**
	* Gets the legal possible moves available in a given position.
	* @param {Position} position - The position to evaluate.
	* @param {Object} options - This options limit where the engine should search.
	* (Optional implementation, used internally by some methods to improve performance).
	* @returns {Move[]} An array of possible moves, including SAN notation,
	* UCI notation and the final position with the updated state.
	*/
	legalMoves(position, options) {}
	/**
	* Calculates the state of a given position.
	* @param {position} position - The position to calculate.
	* @returns {number}
	* * `00000` - Nothing
	* * `00001` - Check
	* * `00010` - Checkmate (losing)
	* * `00100` - Stalemate (no legal moves, draw)
	* * `01000` - Insufficient material (available legal moves, draw)
	* * `10000` - (Suicide and custom) Winning
	* Take in account that this method does not read threefold or
	* fivefold repetitions, or the fifty or seventy-five move rule.
	* For that, use the methods provided by `Game` instances.
	*/
	getGameState(position) {}
	/**
	* This method returns an array of squares threatening
	* a given square.
	* @param {Position} position - The position to check.
	* @param {number} turn - The player who's being attacked.
	* @param {number} square - The square of the attacking player.
	* @returns {number[]} An array of squares.
	*/
	threats(position, turn, square) {}
};
/**
* This `Variant` evaluates games according to standard chess rules,
* sticking as close as possible to the FIDE Laws of Chess.
*/
var StandardVariant = class extends Variant {
	/**
	* Represents the position of the board when the game starts.
	* @param {Object} options - A set of options to take in account
	* when loading the initial position.
	* @param {string} [options.fen] - If included, the engine will
	* start from the chosen FEN string.
	* @returns {Position} The start position with the initial game state.
	*/
	initial({ fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" } = {}) {
		const position = new Position();
		const [pieces, turn, castling, passant, halfMoveCount, move] = fen.trim().split(" ");
		const rows = pieces.split("/");
		for (let n = 0; n < 8; n++) for (let m = 0, offset = 0; m < 8; m++) {
			const piece = rows[7 - n][m - offset];
			if (!isNaN(piece)) {
				m += piece - 1;
				offset += piece - 1;
			} else position.setPiece(m + n * 8, piece);
		}
		position.setState({
			turn: turn == "w" ? 0 : 1,
			whiteHasQueensideCastling: castling.indexOf("Q") !== -1,
			blackHasQueensideCastling: castling.indexOf("q") !== -1,
			whiteHasKingsideCastling: castling.indexOf("K") !== -1,
			blackHasKingsideCastling: castling.indexOf("k") !== -1,
			enPassant: passant !== "-" ? squareToNumber(passant) : null,
			halfMoveCount: +halfMoveCount,
			count: +move,
			state: -1
		});
		return position;
	}
	_getMoves(position, options = {}) {
		const moves = [];
		function pushMove(m) {
			options?.moveDetected?.(m);
			moves.push(m);
		}
		const conflicting = {
			R: /* @__PURE__ */ new Map(),
			B: /* @__PURE__ */ new Map(),
			Q: /* @__PURE__ */ new Map(),
			N: /* @__PURE__ */ new Map()
		};
		const activeConflicts = [];
		const turn = position._state.turn;
		let detectedKing = null, detectedOponentKing = null;
		let whiteHasSufficientMaterial = 0, blackHasSufficientMaterial = 0;
		function rook(r, c, p) {
			const o = r * 8 + c;
			for (let x = c - 1; x >= 0; x--) if (move(r * 8 + x, o, p)) break;
			for (let x = c + 1; x < 8; x++) if (move(r * 8 + x, o, p)) break;
			for (let y = r - 1; y >= 0; y--) if (move(y * 8 + c, o, p)) break;
			for (let y = r + 1; y < 8; y++) if (move(y * 8 + c, o, p)) break;
		}
		function bishop(r, c, p) {
			const o = r * 8 + c;
			for (let x = c - 1, y = r - 1; x >= 0 && y >= 0; x--, y--) if (move(y * 8 + x, o, p)) break;
			for (let x = c - 1, y = r + 1; x >= 0 && y < 8; x--, y++) if (move(y * 8 + x, o, p)) break;
			for (let x = c + 1, y = r + 1; x < 8 && y < 8; x++, y++) if (move(y * 8 + x, o, p)) break;
			for (let x = c + 1, y = r - 1; x < 8 && y >= 0; x++, y--) if (move(y * 8 + x, o, p)) break;
		}
		function move(destination, origin, piece) {
			const destId = position.at(destination);
			if (destId == 0 || destId > 6 !== !!turn) {
				const destPos = new Position().from(position).setState({ enPassant: null }).set(origin, 0).setPiece(destination, turn ? piece.toLowerCase() : piece);
				const m = new Move(destPos, piece + (destId ? "x" : "") + numberToSquare(destination), origin, destination, !!destId ? 1 : 0);
				if (piece !== "K" && piece !== "P") {
					const conflict = conflicting[piece].get(destination);
					if (conflict) {
						if (conflict.length == 1) activeConflicts.push(conflict);
						conflict.push(m);
					} else conflicting[piece].set(destination, [m]);
				} else destPos.setState(position.turn ? {
					blackHasQueensideCastling: false,
					blackHasKingsideCastling: false
				} : {
					whiteHasQueensideCastling: false,
					whiteHasKingsideCastling: false
				});
				if (piece == "R") {
					if (origin == 0) destPos.setState({ whiteHasQueensideCastling: false });
					if (origin == 7) destPos.setState({ whiteHasKingsideCastling: false });
					if (origin == 55) destPos.setState({ blackHasQueensideCastling: false });
					if (origin == 63) destPos.setState({ blackHasKingsideCastling: false });
				}
				pushMove(m);
			}
			if (destId !== 0) return true;
		}
		for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
			const square = r * 8 + c;
			const id = position.at(square);
			if (id == 0) continue;
			if (id == 1 || id == 4 || id == 6) whiteHasSufficientMaterial += 2;
			if (id == 2 || id == 3) whiteHasSufficientMaterial += 1;
			if (id == 7 || id == 10 || id == 12) blackHasSufficientMaterial += 2;
			if (id == 8 || id == 9) blackHasSufficientMaterial += 1;
			const piece = (id - 1) % 6 + 1;
			const color = id > 6;
			if (color !== !!turn) {
				if (piece == 5) detectedOponentKing = square;
				continue;
			} else if (piece == 5) detectedKing = square;
			if (options.limitSquares) {
				if (options.limitSquares.indexOf(square) == -1) continue;
			}
			if (options.limitPiece && options.limitPiece !== id) continue;
			if (piece == 1) rook(r, c, "R");
			else if (piece == 2) for (const m of [
				[2, 1],
				[-2, 1],
				[2, -1],
				[-2, -1],
				[1, 2],
				[1, -2],
				[-1, 2],
				[-1, -2]
			]) {
				if (c + m[0] >= 8 || c + m[0] < 0 || r + m[1] >= 8 || r + m[1] < 0) continue;
				move((r + m[1]) * 8 + (c + m[0]), square, "N");
			}
			else if (piece == 3) bishop(r, c, "B");
			else if (piece == 4) {
				rook(r, c, "Q");
				bishop(r, c, "Q");
			} else if (piece == 5) {
				for (const m of [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1],
					[1, 1],
					[1, -1],
					[-1, -1],
					[-1, 1]
				]) {
					if (c + m[0] >= 8 || c + m[0] < 0 || r + m[1] >= 8 || r + m[1] < 0) continue;
					move((r + m[1]) * 8 + (c + m[0]), square, "K");
				}
				const state = position._state;
				if (options.noCheckCastling) continue;
				if (!color) {
					if (state.whiteHasQueensideCastling && (position.at(1) | position.at(2) | position.at(3)) == 0) pushMove(new Move(new Position().from(position).setState({
						enPassant: null,
						whiteHasKingsideCastling: false,
						whiteHasQueensideCastling: false
					}).set(square, 0).set(0, 0).set(2, 5).set(3, 1), "O-O-O", 4, 0, 0, null, 2, 3));
					if (state.whiteHasKingsideCastling && (position.at(5) | position.at(6)) == 0) pushMove(new Move(new Position().from(position).setState({
						enPassant: null,
						whiteHasKingsideCastling: false,
						whiteHasQueensideCastling: false
					}).set(square, 0).set(7, 0).set(6, 5).set(5, 1), "O-O", 4, 7, 0, null, 6, 5));
				} else {
					if (state.blackHasQueensideCastling && (position.at(56) | position.at(57) | position.at(58)) == 0) pushMove(new Move(new Position().from(position).setState({
						enPassant: null,
						blackHasKingsideCastling: false,
						blackHasQueensideCastling: false
					}).set(square, 0).set(55, 0).set(57, 11).set(58, 7), "O-O-O", 60, 56, 0, null, 57, 58, true));
					if (state.blackHasKingsideCastling && (position.at(61) | position.at(62)) == 0) pushMove(new Move(new Position().from(position).setState({
						enPassant: null,
						blackHasKingsideCastling: false,
						blackHasQueensideCastling: false
					}).set(square, 0).set(63, 0).set(61, 7).set(62, 11), "O-O", 60, 63, 0, null, 62, 61, true));
				}
			} else if (piece == 6) {
				if (!color) {
					const nextSquare = (r + 1) * 8 + c;
					if (position.at(nextSquare) == 0) {
						if (r == 6) for (const promote of "RNBQ") pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).setPiece(nextSquare, promote), numberToSquare(nextSquare) + "=" + promote, square, nextSquare, 0, promote));
						else pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(nextSquare, id), numberToSquare(nextSquare), square, nextSquare));
						if (r == 1) {
							const nextDouble = 24 + c;
							if (position.at(nextDouble) == 0) {
								const destPos = new Position().from(position).setState({ enPassant: null }).set(square, 0).set(nextDouble, id);
								pushMove(new Move(destPos, numberToSquare(nextDouble), square, nextDouble));
								console.log(c, position.at(nextDouble + 1), position.at(nextDouble - 1));
								if (c !== 7 && position.at(nextDouble + 1) == 12 || c !== 0 && position.at(nextDouble - 1) == 12) destPos.setState({ enPassant: nextSquare });
							}
						}
					}
					const captureLeft = (r + 1) * 8 + c - 1;
					const captureRight = (r + 1) * 8 + c + 1;
					if (c !== 7 && position.at(captureRight) > 6) {
						if (r == 6) for (const promote of "RNBQ") pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).setPiece(captureRight, promote), "abcdefgh"[c] + "x" + numberToSquare(captureRight) + "=" + promote, square, captureRight, 1, promote));
						else pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(captureRight, id), "abcdefgh"[c] + "x" + numberToSquare(captureRight), square, captureRight, 1));
					}
					if (c !== 0 && position.at(captureLeft) > 6) {
						if (r == 6) for (const promote of "RNBQ") pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).setPiece(captureLeft, promote), "abcdefgh"[c] + "x" + numberToSquare(captureLeft) + "=" + promote, square, captureLeft, 1, promote));
						else pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(captureLeft, id), "abcdefgh"[c] + "x" + numberToSquare(captureLeft), square, captureLeft, 1));
					}
					if (c !== 0 && position._state.enPassant === captureLeft) pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(square - 1, 0).set(captureLeft, id), "abcdefgh"[c] + "x" + numberToSquare(captureLeft), square, captureLeft, 1));
					if (c !== 7 && position._state.enPassant == captureRight) pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(square + 1, 0).set(captureLeft, id), "abcdefgh"[c] + "x" + numberToSquare(captureRight), square, captureRight, 1));
				} else {
					const nextSquare = (r - 1) * 8 + c;
					if (position.at(nextSquare) == 0) {
						if (r == 1) for (const promote of "RNBQ") pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).setPiece(nextSquare, promote.toLowerCase()), numberToSquare(nextSquare) + "=" + promote, square, nextSquare, 0, promote));
						else {
							pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(nextSquare, id), numberToSquare(nextSquare), square, nextSquare));
							if (r == 6) {
								const nextDouble = 32 + c;
								if (position.at(nextDouble) == 0) {
									const destPos = new Position().from(position).setState({ enPassant: null }).set(square, 0).set(nextDouble, id);
									pushMove(new Move(destPos, numberToSquare(nextDouble), square, nextDouble));
									console.log(c, position.at(nextDouble + 1), position.at(nextDouble - 1), position.pieceAt(nextDouble + 1), position.pieceAt(nextDouble - 1));
									if (c !== 7 && position.at(nextDouble + 1) == 6 || c !== 0 && position.at(nextDouble - 1) == 6) destPos.setState({ enPassant: nextSquare });
								}
							}
						}
					}
					const captureLeft = (r - 1) * 8 + c - 1;
					const captureRight = (r - 1) * 8 + c + 1;
					if (c !== 7 && position.at(captureRight) !== 0 && position.at(captureRight) < 7) {
						if (r == 1) for (const promote of "RNBQ") pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).setPiece(captureRight, promote.toLowerCase()), "abcdefgh"[c] + "x" + numberToSquare(captureRight) + "=" + promote, square, nextSquare, 1, promote));
						else pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(captureRight, id), "abcdefgh"[c] + "x" + numberToSquare(captureRight), square, captureRight, 1));
					}
					if (c !== 0 && position.at(captureLeft) !== 0 && position.at(captureLeft) < 7) {
						if (r == 1) for (const promote of "RNBQ") pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).setPiece(captureLeft, promote.toLowerCase()), "abcdefgh"[c] + "x" + numberToSquare(captureLeft) + "=" + promote, square, captureRight, 1, promote));
						else pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(captureLeft, id), "abcdefgh"[c] + "x" + numberToSquare(captureLeft), square, captureLeft, 1));
					}
					if (c !== 0 && position._state.enPassant === captureLeft) pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(square - 1, 0).set(captureLeft, id), "abcdefgh"[c] + "x" + numberToSquare(captureLeft), square, captureLeft, 1));
					if (c !== 7 && position._state.enPassant == captureRight) pushMove(new Move(new Position().from(position).setState({ enPassant: null }).set(square, 0).set(square + 1, 0).set(captureRight, id), "abcdefgh"[c] + "x" + numberToSquare(captureRight), square, captureRight, 1));
				}
			}
		}
		for (const conflict of activeConflicts) {
			const destinationNotation = numberToSquare(conflict[0].destination);
			for (const x in conflict) {
				const q = conflict[x];
				const r = Math.floor(q.origin / 8);
				const c = q.origin % 8;
				let rowConflict = false, colConflict = false;
				for (const y in conflict) {
					if (x == y) continue;
					const s = conflict[y];
					const r2 = Math.floor(s.origin / 8);
					const c2 = s.origin % 8;
					if (r == r2) rowConflict = true;
					if (c == c2) colConflict = true;
				}
				let san = q.san[0];
				let originNotation = numberToSquare(q.origin);
				let originRow = originNotation[1];
				let originCol = originNotation[0];
				if (rowConflict || !colConflict) san += originCol;
				if (colConflict) san += originRow;
				if (q.isCapture) san += "x";
				san += destinationNotation;
				q.san = san;
			}
		}
		for (const m in moves) moves[m]._position.setState({
			turn: 1 - turn,
			halfMoveCount: "abcdefgh".indexOf(moves[m].san) !== -1 || moves[m].san.indexOf("x") !== -1 ? 0 : position._state.halfMoveCount + 1,
			count: turn ? position._state.count + 1 : position._state.count
		});
		return {
			moves,
			kingPosition: detectedKing,
			oponentKingPosition: detectedOponentKing,
			whiteHasSufficientMaterial,
			blackHasSufficientMaterial
		};
	}
	_isCheck(position, turn, kingPosition, detailed = false) {
		const threats = [];
		const r = Math.floor(kingPosition / 8);
		const c = kingPosition % 8;
		function throwOrPush(destination) {
			if (detailed) threats.push(destination);
			else throw "check";
		}
		function checkDiagonal(destination) {
			const piece = position.at(destination);
			if (piece == 0) return false;
			if (turn == 0 && (piece == 9 || piece == 10)) throwOrPush(destination);
			if (turn == 1 && (piece == 3 || piece == 4)) throwOrPush(destination);
			return true;
		}
		function checkLine(destination) {
			const piece = position.at(destination);
			if (piece == 0) return false;
			if (turn == 0 && (piece == 7 || piece == 10)) throwOrPush(destination);
			if (turn == 1 && (piece == 1 || piece == 4)) throwOrPush(destination);
			return true;
		}
		function checkKnight(destination) {
			const piece = position.at(destination);
			if (piece == 0) return false;
			if (turn == 0 && piece == 8) throwOrPush(destination);
			if (turn == 1 && piece == 2) throwOrPush(destination);
		}
		function checkKing(destination) {
			const piece = position.at(destination);
			if (piece == 0) return false;
			if (turn == 0 && piece == 11) throwOrPush(destination);
			if (turn == 1 && piece == 5) throwOrPush(destination);
		}
		function checkPawn(destination) {
			const piece = position.at(destination);
			if (piece == 0) return false;
			if (turn == 0 && piece == 12) throwOrPush(destination);
			if (turn == 1 && piece == 6) throwOrPush(destination);
		}
		try {
			for (let x = c - 1, y = r - 1; x >= 0 && y >= 0; x--, y--) if (checkDiagonal(y * 8 + x)) break;
			for (let x = c - 1, y = r + 1; x >= 0 && y < 8; x--, y++) if (checkDiagonal(y * 8 + x)) break;
			for (let x = c + 1, y = r + 1; x < 8 && y < 8; x++, y++) if (checkDiagonal(y * 8 + x)) break;
			for (let x = c + 1, y = r - 1; x < 8 && y >= 0; x++, y--) if (checkDiagonal(y * 8 + x)) break;
			for (let x = c - 1; x >= 0; x--) if (checkLine(r * 8 + x)) break;
			for (let x = c + 1; x < 8; x++) if (checkLine(r * 8 + x)) break;
			for (let y = r - 1; y >= 0; y--) if (checkLine(y * 8 + c)) break;
			for (let y = r + 1; y < 8; y++) if (checkLine(y * 8 + c)) break;
			const kingMoves = [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
				[1, 1],
				[1, -1],
				[-1, -1],
				[-1, 1]
			];
			const knightMoves = [
				[2, 1],
				[-2, 1],
				[2, -1],
				[-2, -1],
				[1, 2],
				[1, -2],
				[-1, 2],
				[-1, -2]
			];
			const pawnMoves = turn ? [[-1, -1], [1, -1]] : [[-1, 1], [1, 1]];
			for (const m of kingMoves) {
				if (c + m[0] >= 8 || c + m[0] < 0 || r + m[1] >= 8 || r + m[1] < 0) continue;
				checkKing((r + m[1]) * 8 + (c + m[0]));
			}
			for (const m of knightMoves) {
				if (c + m[0] >= 8 || c + m[0] < 0 || r + m[1] >= 8 || r + m[1] < 0) continue;
				checkKnight((r + m[1]) * 8 + (c + m[0]));
			}
			for (const m of pawnMoves) {
				if (c + m[0] >= 8 || c + m[0] < 0 || r + m[1] >= 8 || r + m[1] < 0) continue;
				checkPawn((r + m[1]) * 8 + (c + m[0]));
			}
		} catch (e) {
			if (e == "check") return true;
			else throw e;
		}
		if (detailed) return threats;
		return false;
	}
	/**
	* This method returns an array of squares with pieces
	* threatening a given square.
	* @param {Position} position - The position to check.
	* @param {number} turn - The player who's being attacked.
	* @param {number} square - The square of the attacking player.
	* @returns {number[]} An array of square indices.
	*/
	threats(position, turn, square) {
		return this._isCheck(position, turn, square, true);
	}
	/**
	* Gets the legal possible moves available in a given position.
	* @param {Position} position - The position to evaluate.
	* @param {Position} options - This options limit where the engine should search.
	* (Optional implementation, used internally by some methods to improve 
	* the engine performance).
	* @returns {Move[]} An array of possible moves, including SAN notation,
	* UCI notation and the final position with the updated state.
	*/
	legalMoves(position, options) {
		const turn = position._state.turn;
		const t = this;
		let moves, kingPosition, oponentKingPosition, whiteHasSufficientMaterial, blackHasSufficientMaterial;
		try {
			({moves, kingPosition, oponentKingPosition, whiteHasSufficientMaterial, blackHasSufficientMaterial} = this._getMoves(position, {
				...options,
				moveDetected(m) {
					if (!options?.one) return false;
					if (m.san.startsWith("K")) {
						if (t._isCheck(m._position, turn, m.destination)) return false;
					} else if (m.san == "O-O") {
						if (t._isCheck(m._position, turn, kingPosition) || t._isCheck(m._position, turn, kingPosition + 1) || t._isCheck(m._position, turn, kingPosition + 2)) return false;
					} else if (m.san == "O-O-O") {
						if (t._isCheck(m._position, turn, kingPosition) || t._isCheck(m._position, turn, kingPosition - 1) || t._isCheck(m._position, turn, kingPosition - 2)) return false;
					} else if (t._isCheck(m._position, turn, kingPosition)) return false;
					throw m;
				}
			}));
		} catch (e) {
			if (e instanceof Move) return [e];
			throw e;
		}
		if (options?.one) return [];
		const finalMoves = [];
		position._whiteHasSufficientMaterial = whiteHasSufficientMaterial;
		position._blackHasSufficientMaterial = blackHasSufficientMaterial;
		if (whiteHasSufficientMaterial < 2 && blackHasSufficientMaterial < 2) return [];
		for (let m = 0; m < moves.length; m++) {
			if (moves[m].san.startsWith("K")) {
				if (this._isCheck(moves[m]._position, turn, moves[m].destination)) continue;
			} else if (moves[m].san == "O-O") {
				if (this._isCheck(moves[m]._position, turn, kingPosition) || this._isCheck(moves[m]._position, turn, kingPosition + 1) || this._isCheck(moves[m]._position, turn, kingPosition + 2)) continue;
			} else if (moves[m].san == "O-O-O") {
				if (this._isCheck(moves[m]._position, turn, kingPosition) || this._isCheck(moves[m]._position, turn, kingPosition - 1) || this._isCheck(moves[m]._position, turn, kingPosition - 2)) continue;
			} else if (this._isCheck(moves[m]._position, turn, kingPosition)) continue;
			moves[m]._check = 1;
			moves[m]._checkmate = 1;
			if (this._isCheck(moves[m]._position, 1 - turn, oponentKingPosition)) {
				if (!this.legalMoves(moves[m]._position).length) {
					moves[m]._checkmate = 2;
					moves[m]._check = 2;
					moves[m].san += "#";
				} else {
					moves[m]._check = 2;
					moves[m].san += "+";
				}
			}
			finalMoves.push(moves[m]);
		}
		return finalMoves;
	}
	getGameState(position) {
		const turn = position._state.turn;
		if (position?.move?._checkmate == 2) return 3;
		if (position?.move?._check == 2) return 1;
		let kingPosition = null;
		let whiteHasSufficientMaterial = 0;
		let blackHasSufficientMaterial = 0;
		for (let n = 0; n < 64; n++) {
			const id = position.at(n);
			if (id == (turn ? 11 : 5)) {
				kingPosition = n;
				if ((position?.move?._check ?? 1) !== 1 || this._isCheck(position, turn, kingPosition)) {
					if (!this.legalMoves(position, { one: true }).length) return 3;
					else return 1;
				} else if (!this.legalMoves(position, { one: true }).length) return 4;
			}
			if (id == 0) continue;
			if (id == 1 || id == 4 || id == 6) whiteHasSufficientMaterial += 2;
			if (id == 2 || id == 3) whiteHasSufficientMaterial += 1;
			if (id == 7 || id == 10 || id == 12) blackHasSufficientMaterial += 2;
			if (id == 8 || id == 9) blackHasSufficientMaterial += 1;
			if ((whiteHasSufficientMaterial > 1 || blackHasSufficientMaterial > 1) && kingPosition !== null) break;
		}
		if (whiteHasSufficientMaterial > 1 || blackHasSufficientMaterial > 1) return 0;
		else return 8;
	}
};
/**
* Represents a variant, starting in other `Branch` or in a preset position.
* 
*/
var Branch = class {
	_internalRepetitionMap = /* @__PURE__ */ new Map();
	/**
	* Represents the parent of this branch. `null` if the branch
	* does not have a parent or it is the main game branch.
	* @type {Branch}
	*/
	parent = null;
	/**
	* Represents the move count start of this branch, starting
	* on the main branch. It must be greater or equal than
	* the parent's move count start.
	* @type {number}
	*/
	countStart = 0;
	/**
	* An array of moves. The move in index 0 represents a movement
	* with the actual branch move count start as its overall index.
	* @type {Move[]}
	*/
	moves = [];
	/**
	* An array of branches with origin on this branch.
	* @type {Branch[]}
	*/
	children = [];
	/**
	* (Suicide and custom) `true` if the game can't continue because the
	* actual player has won, typically by getting stalemated or having all
	* their pieces captured. `false` otherwise.
	* @type {boolean}
	*/
	isWinning = false;
	/**
	* (read-only) `true` if the game can't continue because the actual player has
	* been checkmated. `false` otherwise.
	* @type {boolean}
	*/
	isCheckmate = false;
	/**
	* `true` if the actual player has been stalemated. `false` otherwise.
	* @type {boolean}
	*/
	isStalemate = false;
	/**
	* `true` if there have been 75 moves without the movement of any
	* pawn and without captures, according to the FIDE 75-move rule (9.6b).
	* The actual rule set manages the half move count internally.
	* `false` otherwise.
	* @type {boolean}
	*/
	get isSeventyfiveMoves() {
		return this.moves[this.moves.length - 1]._position._state.halfMoveCount >= 150;
	}
	/**
	* @readonly
	* `true` if the same position has been repeated 5 times, separated by 
	* any number of other moves, according to the FIDE fivefold repetition
	* rule (9.6a). The game manages the repetition count internally.
	* @type {boolean}
	*/
	get isFivefoldRepetition() {
		return this.repetitionCount >= 5;
	}
	/**
	* Represents the maximum number of times a position was repeated
	* in this variant, separated by any number of other moves.
	* A count of 3 is enough to claim draw. A count of 5 is
	* results in automatic draw.
	* @type {number}
	*/
	repetitionCount = 0;
	/**
	* `true` if none of the players can checkmate the opponent's king.
	* `false` otherwise.
	* @type {boolean}
	*/
	isDeadPosition = false;
	/**
	* @readonly
	* `true` if the game cannot continue. `false` otherwise.
	* 
	* Take in account that branches do not have in account claimed draws,
	* agreement draws, resignations, time forfeit or unexpected endings - the
	* core `Game` does. This method does only take in account position-related
	* possible endings. Fivefold repetitions, 75 moves and dead positions
	* will be taken into account.
	*/
	get isGameOver() {
		return this.isFivefoldRepetition || this.isSeventyfiveMoves || this.isDeadPosition || this.isStalemate || this.isCheckmate || this.isWinning;
	}
};
/**
* A `PositionView` offers methods to read and analyze
* a given chess position and its corresponding move.
* 
* It is usually instanced internally by `Game` and `Branch`.
*/
var PositionView = class extends Position {
	/**
	* Instances a `PositionView` manually. Useful to read
	* the position after a move or from a raw position.
	* @param {Move | Position} move - A `Move` or a `Position`.
	* @param {Game} game - The game this positition comes from.
	* The position doesn't strictly need to be *from* the game,
	* but it is needed as a reference for accessing rules and other
	* context-related features.
	* It is possible to create a `PositionView` without a game,
	* but some properties won't work. 
	*/
	constructor(move, game = null) {
		super();
		if (move instanceof Move) {
			super._buffer = move._position._buffer;
			super._state = move._position._state;
			this.move = move;
		} else if (move instanceof Position) {
			super._buffer = move._buffer;
			super._state = move._state;
			this.move = null;
		}
		this.game = game;
	}
	#gameState = null;
	#fen = null;
	#whiteKingPosition = null;
	#blackKingPosition = null;
	setPiece = null;
	set = null;
	state = null;
	setState = null;
	/**
	* @type {Game}
	* The `Game` which created this `PositionView`.
	*/
	game = null;
	/**
	* @readonly
	* (Read-only)
	* Returs the player who has to play this `position`. This
	* is, if White moved to this position, `turn` will be 1
	* (black).
	* 0 represents the White player, while 1 represents the Black player.
	* @type {0 | 1}
	*/
	get turn() {
		return this._state.turn;
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the player's king is in check. For Suicide games,
	* returns `true` if a capture is forced. Returns `false` otherwise.
	* 
	* Checkmates are also considered checks.
	* @type {boolean}
	*/
	get isCheck() {
		if (this.move?._check) {
			if (this.move?._check == 2) return true;
			return false;
		}
		if (this.#gameState === null) this.#gameState = this.game.variant.getGameState(this);
		console.log(this.#gameState.toString(2));
		return !!(this.#gameState & 1);
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the player's king is in checkmate. For variants,
	* this property is `true` if the oponent has won and the game won't
	* continue. For Suicide games this property is always `false`.
	* @type {boolean}
	*/
	get isCheckmate() {
		if (this.move?._checkmate) {
			if (this.move?._checkmate == 2) return true;
			return false;
		}
		if (this.#gameState === null) this.#gameState = this.game.variant.getGameState(this);
		return !!(this.#gameState & 2);
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the player is in stalemate (has no
	* legal moves). In Standard chess, checkmates are not considered
	* stalemates.
	* @type {boolean}
	*/
	get isStalemate() {
		if (this.#gameState === null) this.#gameState = this.game.variant.getGameState(this);
		return !!(this.#gameState & 4);
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if neither player has enough material to continue, 
	* `false` otherwise.
	* @type {boolean}
	*/
	get isDeadPosition() {
		if (this._whiteHasSufficientMaterial !== null && this._blackHasSufficientMaterial !== null) {
			console.log("Checking dead position");
			return this._whiteHasSufficientMaterial < 2 && this._blackHasSufficientMaterial < 2;
		}
		if (this.#gameState === null) this.#gameState = this.game.variant.getGameState(this);
		return !!(this.#gameState & 8);
	}
	/**
	* @readonly
	* (Read-only)
	* (Suicide and custom) Returns `true` if the actual player is winning,
	* either by stalemate or by having no material.
	* @type {boolean}
	*/
	get isWinning() {
		if (this.#gameState === null) this.#gameState = this.game.variant.getGameState(this);
		return !!(this.#gameState & 16);
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the game won't continue, either by draw, winning or losing.
	* @type {boolean}
	*/
	get isGameOver() {
		return this.isWinning || this.isCheckmate || this.isStalemate || this.isDeadPosition;
	}
	/**
	* @readonly
	* Returns `true` if the game has ended in a draw.
	* @type {boolean}
	*/
	get isDraw() {
		return !this.isWinning && !this.isCheckmate && (this.isDeadPosition || this.isStalemate || this.halfMoveCount >= 150);
	}
	/**
	* Looks for threats in a square.
	* @param {string | number} square - The square to search threats from.
	* It might be in string format (`c5`) or as a number (42). Strings are case-sensitive.
	* @param {number} turn - The player who's threatened (or, the oponent of the player
	* who's attacking). `0` for white, `1` for black. Defaults to the actual turn.
	* @returns {number[]} - An array of squares, corresponding to the pieces
	* attacking the square with an opposite color to the chosen one. The same square
	* will never be returned.
	*/
	threats(square, turn = this.turn) {
		if (typeof square == "string") square = squareToNumber(square);
		return this.game.variant.threats(this, turn, square);
	}
	/**
	* Finds all pieces of a given type. Use lowercase letters for
	* black pieces and uppercase letters for white pieces.
	* @param {string} type - The piece to search.
	* @returns {number[]} - An array with all the square indices
	* which contain the selected piece.
	*/
	findPieces(type) {
		let arr = [];
		for (let n = 0; n < 64; n++) if (this.pieceAt(n) == type) arr.push(n);
		return arr;
	}
	/**
	* (Read-only)
	* Returns the index of the square where the white king
	* is. If there's no king or there's more than one king,
	* returns `null`.
	* @readonly
	* @type {number?}
	*/
	get whiteKingPosition() {
		if (!this.#whiteKingPosition) this.#whiteKingPosition = this.findPieces("K");
		if (this.#whiteKingPosition.length != 1) return null;
		return this.#whiteKingPosition[0];
	}
	/**
	* (Read-only)
	* Returns the index of the square where the black king
	* is. If there's no king or there's more than one king,
	* returns `null`.
	* @readonly
	* @type {number?}
	*/
	get blackKingPosition() {
		if (!this.#blackKingPosition) this.#blackKingPosition = this.findPieces("k");
		if (this.#blackKingPosition.length != 1) return null;
		return this.#blackKingPosition[0];
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the white player *might* castle **kingside.**
	* This method doesn't check if the move is legal, it just checks
	* if it is available.
	* @type {boolean}
	*/
	get whiteHasKingsideCastling() {
		return !!this._state.whiteHasKingsideCastling;
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the white player *might* castle **queenside.**
	* This method doesn't check if the move is legal, it just checks
	* if it is available.
	* @type {boolean}
	*/
	get whiteHasQueensideCastling() {
		return !!this._state.whiteHasQueensideCastling;
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the black player *might* castle **kingside.**
	* This method doesn't check if the move is legal, it just checks
	* if it is available.
	* @type {boolean}
	*/
	get blackHasKingsideCastling() {
		return !!this._state.blackHasKingsideCastling;
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the black player *might* castle **queenside.**
	* This method doesn't check if the move is legal, it just checks
	* if it is available.
	* @type {boolean}
	*/
	get blackHasQueensideCastling() {
		return !!this._state.blackHasQueensideCastling;
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the actual player *might* castle **kingside.**
	* This method doesn't check if the move is legal, it just checks
	* if it is available.
	* @type {boolean}
	*/
	get hasKingsideCastling() {
		return this.turn ? this.blackHasKingsideCastling : this.whiteHasKingideCastling;
	}
	/**
	* @readonly
	* Returns the half move count (The number of half moves since the last capture
	* or pawn movement).
	* @type {number}
	*/
	get halfMoveCount() {
		return this._state.halfMoveCount;
	}
	/**
	* @readonly
	* (Read-only)
	* Returns `true` if the actual player *might* castle **queenside.**
	* This method doesn't check if the move is legal, it just checks
	* if it is available.
	* @type {boolean}
	*/
	get hasQueensideCastling() {
		return this.turn ? this.blackHasQueensideCastling : this.whiteHasQueensideCastling;
	}
	get playerHasEnPassant() {
		return this._state.enPassant;
	}
	/**
	* Checks if a move is legal. This method works for strings and
	* can check if a move in SAN (Standard Algebraic Notation) or UCI (Universal
	* Chess Interface) is legal and supported.
	* 
	* SAN move annotations other than `?`, `!`, `??`, `!!`, `!?`, `?!` are not recommended. Check and
	* checkmante annotations (`+`, `#` / `++`), incorrect captures,
	* Long Algebraic Notation and incorrect move disambiguation are ignored.
	* Still, behavior with incorrect SAN is not guaranteed. 
	* 
	* Invalid captures will be ignored. Invalid drops won't.
	* 
	* SAN castle notation is supported with both characters `O` and `0`. Promotion is recommended to be written
	* with the symbol `=`.
	* 
	* This method is case-sensitive.
	* 
	* This method will return `false` if the move is **illegal**, **unparseable**, or **ambiguous**.
	* 
	* This method does take in account the half move count. If the half move count is greater or 
	* equal than 75, this method will **always** return `false` as the position is considered automatically
	* drawn.
	* 
	* This method does take in account if there is enough material to continue. If this is a dead position
	* this method will always return `false`.
	* 
	* This method does not take in account the position repetition count, as it is not stored within
	* the `PositionView` instance. 
	* 
	* @param {string} notation - The move to parse in SAN or UCI notation.
	* @returns {boolean?}
	*/
	isLegal(notation) {
		if (!this.game) return null;
		return this.game.parse(notation) instanceof Move;
	}
	/**
	* Returns an array with all possible moves given this position.
	* This function takes no arguments.
	* ```
	* const legalMoves = game.position.legalMoves();
	* console.log(legalMoves.map(move => move.san));
	* ```
	* @returns {Move[]} An array of moves. Take in account that this array
	* contains **just** the moves. If you need to analyze the resulting position, 
	* you must use the `PositionView` constructor, or append the move to the game.
	* ```
	* const view = new PositionView(move, game);
	* game.push(move);
	* ```
	*/
	legalMoves() {
		return this.game.variant.legalMoves(this);
	}
	/**
	* @readonly
	* Returns the FEN string of this position.
	*/
	get fen() {
		if (!this.#fen) {
			let out = "";
			for (let f = 7; f >= 0; f--) {
				let spacing = 0;
				let local = "";
				for (let r = 0; r < 8; r++) {
					const p = this.pieceAt(f * 8 + r);
					if (!p) spacing++;
					else {
						if (spacing) {
							local += spacing;
							spacing = 0;
						}
						local += p;
					}
				}
				if (spacing) local += spacing;
				out += local;
				if (f) out += "/";
			}
			this.#fen = `${out} ${this.turn ? "b" : "w"} ${(this.whiteHasKingsideCastling ? "K" : "") + (this.whiteHasQueensideCastling ? "Q" : "") + (this.blackHasKingsideCastling ? "k" : "") + (this.blackHasQueensideCastling ? "q" : "") || "-"} ${this.enPassant ?? "-"} ${this.halfMoveCount} ${this._state.count}`;
		}
		return this.#fen;
	}
};
/**
* Represents a chess game in a PGN-like structure. Supports PGN load with multiple
* branches, move comments, metadata, and clock and engine evaluation game notations.
*/
var Game = class {
	/**
	* Creates a new `Game` instance.
	* ```
	* const g = new Game();
	* g.begin();
	* ```
	* @overload
	* This function can be called with no arguments.
	* @overload
	* @param {Variant} ruleSet - A `Variant` instance that 
	* the Game will use.
	* @overload
	* @param {string} pgn - A PGN string to load the game. The PGN headers will
	* also decide which rule set should be used, the FEN starting position and 
	* @param {Variant} [ruleSet] (optional) - A ruleSet to override the specified
	* by the PGN file.
	*/
	constructor(...args) {
		this.mainBranch = new Branch();
		this.#activeBranch = [this.mainBranch];
		this.pgn = new PGNParser(this);
		if (args[0] instanceof Variant) this.variant = args[0];
		else if (args[0] instanceof String) this.pgn.import(args[0], args[1]);
	}
	#lastPosView = null;
	#initialPosition = null;
	#initialPosView = null;
	#activeBranch = [];
	#lastResult = 0;
	#lastRealResult = -1;
	#lastTmpResult = -1;
	/**
	* The active variant of the game.
	* @type {Variant}
	*/
	variant = new StandardVariant();
	/**
	* (Read-only)
	* The root branch of this game.
	* @readonly
	* @type {Branch}
	*/
	mainBranch = null;
	_updateActiveBranch(branch) {
		this.#activeBranch = [];
		for (let b = branch, n = 0; b !== this.mainBranch && n < 256; n++) {
			this.#activeBranch.unshift(b);
			b = b.parent;
		}
		this.#activeBranch.unshift(this.mainBranch);
	}
	/**
	* Gets the game position at a given index using the selected branch.
	* The indices are zero-based: index 0 represents the first (usually white)
	* move, index 1 represents the oponent's move.
	* 
	* Index -1 represents the initial position. Indices below 1 return undefined.
	* ```
	* // Goes to the 31st half move (16-th white move)
	* const view = g.getPositionAt(30);
	* console.log(view.isCheck);
	* ```
	* @param {number} x - The index of the move.
	* @returns {PositionView} The selected move and position. For indices
	* out of range, it'll return `undefined`.
	*/
	getPositionAt(x) {
		if (x < -1) return void 0;
		if (x == -1) return this.initialPosition;
		for (const n in this.#activeBranch) {
			const next = this.#activeBranch[+n + 1];
			if (next) {
				if (x >= next.countStart) continue;
			}
			const actual = this.#activeBranch[n];
			const offset = x - actual.countStart;
			if (offset >= actual.moves.length) return;
			else return new PositionView(actual.moves[offset], this);
		}
	}
	/**
	* Gets the move metadata at a given index of the active branch.
	* The indices are zero-based: index 0 represents the first (usually white)
	* move, index 1 represents the oponent's move.
	* ```
	* // Goes to the 44th half move (22-th black move)
	* const move = g.getMoveAt(43);
	* console.log(move.san);
	* ```
	* @param {number} x - The index of the move.
	* @returns {Move} The selected move metadata. For negative indices and indices
	* out of range, it'll return `undefined`.
	*/
	getMoveAt(x) {
		if (x < 0) return void 0;
		for (const n in this.#activeBranch) {
			const next = this.#activeBranch[+n + 1];
			if (next) {
				if (x >= next.countStart) continue;
			}
			const actual = this.#activeBranch[n];
			const offset = x - actual.countStart;
			if (offset >= actual.moves.length) return;
			else return actual.moves[offset];
		}
	}
	/**
	* Returns the variant branch active in a given position, based
	* on the selected variant.
	* The indices are zero-based: index 0 represents the first (usually white)
	* move, index 1 represents the oponent's move.
	* ```
	* const branch = g.getBranchAt(12);
	* g.useBranch(branch);
	* ```
	* @param {number} x - The index of the move.
	* @returns {Branch} - The branch containing the move selected.
	* 
	*/
	getBranchAt(x) {
		for (const n in this.#activeBranch) {
			const next = this.#activeBranch[+n + 1];
			if (next) {
				if (x >= next.countStart) continue;
			}
			return this.#activeBranch[n];
		}
	}
	/**
	* Creates a new variant branch, starting in a given position,
	* and inheriting from the active branch.
	* ```
	* const branch = g.createBranchAt(12);
	* g.useBranch(branch);
	* ```
	* @param {*} x - The index where the branch will start.
	* @returns {Branch} - The created branch.
	*/
	createBranchAt(x) {
		const branch = new Branch();
		const parent = this.getBranchAt(x);
		branch.parent = parent;
		parent.children.push(branch);
		branch.countStart = x;
		const rmap = structuredClone(parent._internalRepetitionMap);
		for (const [key, value] in rmap) {
			for (let n = value.length; n >= 0; n--) {
				if (value[value.length - 1] >= x) {
					value.pop();
					continue;
				}
				break;
			}
			if (value.length == 0) rmap.delete(key);
			branch.repetitionCount = Math.max(branch.repetitionCount, value.length);
		}
		branch.rmap = rmap;
		return branch;
	}
	/**
	* Sets a variant branch as active.
	*/
	useBranch(branch) {
		this.#lastTmpResult = -1;
		this._updateActiveBranch(branch);
		const x = branch.countStart + branch.moves.length;
		for (let b = branch, n = 0; n < 256; n++) {
			if (x - 1 - b.countStart < 0) {
				if (b == this.mainBranch) break;
				b = b.parent;
				continue;
			}
			this.#lastPosView = new PositionView(b.moves[x - 1 - b.countStart], this);
			return;
		}
		this.#lastPosView = null;
	}
	/**
	* (Read-only)
	* Represents a reference to the latest move in the actual branch.
	* @readonly
	* @type {PositionView}
	*/
	get position() {
		return this.#lastPosView ?? this.#initialPosView;
	}
	/**
	* @readonly
	* Represents a reference to the initial position of the game.
	* @type {PositionView}
	*/
	get initialPosition() {
		return this.#initialPosView;
	}
	/**
	* @readonly
	* Counts all half-moves (both white and black moves) to the end
	* of the actual branch.
	* @type {number}
	*/
	get moveCount() {
		const last = this.#activeBranch[this.#activeBranch.length - 1];
		return last.countStart + last.moves.length;
	}
	_autoTerminate = true;
	/**
	* Pushes a move to the selected branch, as a `Move` instance.
	* **This method does not check if the move is legal,** it just appends 
	* the move to the back of the internal array. If you do not have a 
	* `Move` instance already, use `Game.move()` instead.
	* @param {Move} move - The move to add to the game.
	*/
	push(move) {
		const branch = this.#activeBranch[this.#activeBranch.length - 1];
		const moves = branch.moves;
		moves.push(move);
		if (!branch._internalRepetitionMap) branch._internalRepetitionMap = /* @__PURE__ */ new Map();
		let rmap = branch._internalRepetitionMap.get(move._position.hash);
		if (!rmap) {
			rmap = [];
			branch._internalRepetitionMap.set(move._position.hash, rmap);
		}
		rmap.push(moves.length + branch.countStart);
		if (rmap.length > branch.repetitionCount) branch.repetitionCount = rmap.length;
		this.#lastPosView = new PositionView(move, this);
		if (branch == this.mainBranch && this._autoTerminate) {
			if (branch.repetitionCount >= 5) this.terminate(3, "normal");
			else if (this.position.isWinning) this.terminate(1 + this.position.turn, "normal");
			else if (this.position.isCheckmate) this.terminate(2 - this.position.turn, "normal");
			else if (this.position.isDraw) this.terminate(3, "normal");
		}
		this.#lastTmpResult = -1;
	}
	/**
	* Parses a SAN move.
	* @param {string} notation - The move in algebraic (SAN) or UCI notation, as a string.
	* @param {string} position - The move in algebraic (SAN) or UCI notation, as a string.
	* @returns {Move | number} A Move if the move is correct. 1 if the move
	* is ambiguous, 2 if the move is illegal, 3 if the game is over, 4 if the move is unparseable.
	*/
	parse(notation, position = this.position) {
		if (position.halfMoveCount >= 150) return 2;
		const turn = position._state.turn;
		const setSuffix = (suffix, move) => {
			if (!suffix) return;
			suffix.replace(/^(\+\+|\+|#)/, "");
			suffix.trim();
			if (suffix == "!") move.annotationGlyph = 1;
			else if (suffix == "?") move.annotationGlyph = 2;
			else if (suffix == "!!") move.annotationGlyph = 3;
			else if (suffix == "??") move.annotationGlyph = 4;
			else if (suffix == "!?") move.annotationGlyph = 5;
			else if (suffix == "?!") move.annotationGlyph = 6;
		};
		if (notation.startsWith("0-0") || notation.startsWith("O-O")) {
			const legalMoves = this.variant.legalMoves(position, {
				limitPiece: turn ? 11 : 5,
				limitSquares: turn ? [60] : [4]
			});
			for (const m of legalMoves) if (m.san == "O-O") {
				setSuffix(notation.substring(3), m);
				return m;
			}
			if (this.result == 0) return 2;
			else return 3;
		}
		if (notation.startsWith("0-0-0") || notation.startsWith("O-O-O")) {
			const legalMoves = this.variant.legalMoves(this.position, {
				limitPiece: turn ? 11 : 5,
				limitSquares: turn ? [60] : [4]
			});
			for (const m of legalMoves) if (m.san == "O-O-O") {
				setSuffix(notation.substring(5), m);
				return m;
			}
			if (this.result == 0) return 2;
			else return 3;
		}
		if (/^[a-h][1-8][a-h][1-8][RNBQKPrnbqkp]?$/.test(notation)) {
			const from = squareToNumber(notation[0] + notation[1]);
			const to = squareToNumber(notation[2] + notation[3]);
			const promotion = notation[4]?.toUpperCase?.();
			const legalMoves = this.variant.legalMoves(this.position, { limitPiece: this.position.at(from) });
			for (const m of legalMoves) {
				if (m.mode == 2) continue;
				if (m.destination == to && m.origin == from && (!promotion || m.san.endsWith(promotion))) return m;
				if (m.castling == -1 && m.origin - to == 2 || m.castling == 1 && m.origin - to == -2) return m;
			}
			if (this.result == 0) return 2;
			else return 3;
		}
		const pieceRegex = /^[RNBQKP]$/;
		const colRegex = /^[a-h]$/;
		const rowRegex = /^[1-8]$/;
		let r = 0, piece, firstRow, firstCol, secRow, secCol, isDrop = false, promotion;
		if (pieceRegex.test(notation[r])) piece = notation[r++];
		else piece = "P";
		if (colRegex.test(notation[r])) firstCol = notation[r++];
		if (rowRegex.test(notation[r])) firstRow = notation[r++];
		if (notation[r] == "x") r++;
		else if (notation[r] == "@") {
			isDrop = true;
			r++;
		}
		if (colRegex.test(notation[r])) secCol = notation[r++];
		if (rowRegex.test(notation[r])) secRow = notation[r++];
		if (notation[r] == "=" || notation[r] == "/" || notation[r] == "(") r++;
		if (pieceRegex.test(notation[r])) promotion = notation[r++];
		const suffix = notation.substring(r);
		if (firstRow && firstCol && !secRow && !secCol) {
			const to = squareToNumber(firstCol + firstRow);
			const legalMoves = this.variant.legalMoves(this.position, { limitPiece: "RNBQKP".indexOf(piece) + 1 + turn * 6 });
			const possibleMoves = [];
			for (const m of legalMoves) if ((isDrop ? m.type == 2 : m.type !== 2) && m.destination == to && (!promotion || m.san.endsWith(promotion))) possibleMoves.push(m);
			if (possibleMoves.length > 1) return 1;
			if (possibleMoves.length < 1) {
				if (this.result == 0) return 2;
				else return 3;
			}
			setSuffix(suffix, possibleMoves[0]);
			return possibleMoves[0];
		} else if (secRow && secCol) {
			const to = squareToNumber(secCol + secRow);
			let from = null;
			if (firstRow && firstCol) from = [squareToNumber(firstCol + firstRow)];
			else if (firstRow) from = [
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7
			].map((e) => e + firstRow * 8);
			else if (firstCol) from = [
				0,
				8,
				16,
				24,
				32,
				40,
				48,
				56
			].map((e) => e + "abcdefgh".indexOf(firstCol));
			const legalMoves = this.variant.legalMoves(this.position, { limitPiece: "RNBQKP".indexOf(piece) + 1 + turn * 6 });
			const possibleMoves = [];
			for (const m of legalMoves) if ((isDrop ? m.type == 2 : m.type !== 2) && m.destination == to && (!promotion || m.san.endsWith(promotion)) && (!from || from.indexOf(m.origin) !== -1)) possibleMoves.push(m);
			if (possibleMoves.length > 1) return 1;
			if (possibleMoves.length < 1) {
				if (this.result == 0) return 2;
				else return 3;
			}
			setSuffix(suffix, possibleMoves[0]);
			return possibleMoves[0];
		} else return 4;
	}
	/**
	* Pushes a move to the selected branch, given the move notation
	* in either SAN (Standard Algebraic Notation) or UCI (Universal Chess Interface)
	* format.
	* 
	* ```
	* const g = new Game();
	* g.begin();
	* g.move('e4');
	* g.move('e5');
	* g.move('Bc4');
	* ```
	* This method uses performance optimizations and checks for
	* SAN ambiguities or conflicts, making it faster and safer.
	* 
	* This method checks for legal moves. Illegal moves will throw an error.
	* 
	* This method will throw an error if the move in SAN notation is ambiguous (many
	* similar pieces can move to the chosen position, the promotion piece is not given)
	* or if the promotion piece in a promotion in UCI notation is not included.
	* 
	* If the move is unparseable, this method will throw an error.
	* 
	* SAN move annotations other than `?`, `!`, `??`, `!!`, `!?`, `?!` are not recommended. Check and
	* checkmante annotations (`+`, `#` / `++`), incorrect captures,
	* Long Algebraic Notation and incorrect move disambiguation are ignored.
	* Still, behavior with incorrect SAN is not guaranteed. 
	* 
	* SAN castle notation is supported with both characters `O` and `0`. Promotion is recommended to be written
	* with the symbol `=`.
	* 
	* This method is case-sensitive.
	* 
	* @param {string} notation - The move in algebraic (SAN) or UCI notation, as a string.
	*/
	move(notation) {
		if (this.#activeBranch[this.#activeBranch.length - 1].repetitionCount >= 5) throw new Error("The game is already over.");
		if (this.#activeBranch[this.#activeBranch.length - 1] == this.mainBranch) {
			if (this.#lastResult) throw new Error("The game is already over.");
		}
		const r = this.parse(notation);
		if (r instanceof Move) {
			this.push(r);
			return;
		}
		if (r == 1) throw new Error("The move (" + notation + ") is ambiguous.");
		if (r == 2) throw new Error("The move (" + notation + ") is illegal.");
		if (r == 3) throw new Error("The game is already over.");
		if (r == 4) throw new Error("The move (" + notation + ") is unparseable.");
	}
	/**
	* Checks if a movement in SAN notation is legal. A movement is considered legal
	* if it is possible and not ambiguous.
	* 
	* ```
	* const g = new Game();
	* console.log(g.isLegal('e4'));
	* console.log(g.isLegal('O-O'));
	* ```
	* @param {string} notation - The move in algebraic (SAN) or UCI notation, as a string.
	*/
	isLegal(notation) {
		if (this.#activeBranch[this.#activeBranch.length - 1].repetitionCount >= 5) return false;
		if (this.#activeBranch[this.#activeBranch.length - 1] == this.mainBranch) return false;
		return this.parse(notation) instanceof Move;
	}
	/**
	* Sets the initial position of this Game. It should be called every time
	* the Game is started.
	* 
	* This function also clears the game.
	* ```
	* const g = new Game();
	* g.begin();
	* g.begin('rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq - 4 6');
	* ```
	* @overload
	* This function may be called with no arguments.
	* @overload
	* @param {string} fen - The initial FEN string.
	* 
	*/
	begin(...args) {
		this.clear();
		if (typeof args[0] == "string") {
			this.customPosition = true;
			this.#initialPosition = this.variant.initial({ fen: args[0] });
			this.#initialPosView = new PositionView(this.#initialPosition, this);
		} else if (args.length == 0) {
			this.#initialPosition = this.variant.initial();
			this.#initialPosView = new PositionView(this.#initialPosition, this);
		}
	}
	/**
	* Clears all branches and data inside this Game.
	* This function takes no arguments.
	*/
	clear() {
		this.mainBranch = new Branch();
		this.#activeBranch = [this.mainBranch];
	}
	/**
	* Returns all possible legal moves given this position.
	* @returns {Move[]} An array containing all legal moves.
	*/
	legalMoves() {
		if (this.#activeBranch[this.#activeBranch.length - 1].repetitionCount >= 5) return [];
		if (this.#activeBranch[this.#activeBranch.length - 1] == this.mainBranch) {
			if (this.#lastResult) return [];
		}
		if (this.position.halfMoveCount >= 150 || this.position.isGameOver) return [];
		return this.variant.legalMoves(this.position);
	}
	/**
	* This property represents a PGN tag.
	* 
	* The event type, name or ID. It should be reasonably descriptive.
	* Used to facilitate database scanning. If unset, a question mark
	* (`?`) will appear when exporting to PGN.
	* 
	* Examples: `FIDE World Championship`, `ACM North American Computer Championship`,
	* `Rated bullet game`
	* @type {string}
	*/
	event = null;
	/**
	* This property represents a PGN tag.
	* 
	* The location of the event. It can be a physical location or a virtual
	* location as an URL. If unset, a question mark (`?`) will appear when 
	* exporting to PGN.
	* @type {string}
	*/
	site = null;
	/**
	* This property represents a PGN tag.
	* 
	* The date when the game started, in `YYYY.MM.DD` format. If any of the fields
	* (year, month, day) is unknown, question marks will be used instead. If
	* not present when exporting, the value `????.??.??` will be used.
	* @type {string}
	*/
	pgnDate = null;
	/**
	* The date when the game started, in `YYYY.MM.DD` format, according to the UTC
	* standard. If any of the fields
	* (year, month, day) is unknown, question marks will be used instead.
	* @type {string}
	*/
	pgnUTCDate = null;
	/**
	* The time when the game started, in `HH:MM:SS` format, according to the UTC
	* time standard. If any of the fields (hours, minutes, seconds) is unknown,
	* question marks will be used instead.
	* @type {string}
	*/
	pgnUTCTime = null;
	/**
	* The time when the game started, in `HH:MM:SS` format.
	* If any of the fields (hours, minutes, seconds) is unknown,
	* question marks will be used instead.
	* @type {string}
	*/
	pgnTime = null;
	/**
	* This property represents a PGN tag.
	* 
	* The round number of the played game, as a list of numbers separated by periods.
	* If not present when exporting, a single hyphen (`-`) character will be used.
	* @type {string}
	*/
	round = null;
	/**
	* This property represents a PGN tag.
	* 
	* The name, username or nickname of the player(s) with the white pieces. Real
	* names should be given
	* as they would appear in a telephone directory (last names first). If unset,
	* a single question mark (`?`) will be used when exporting.
	* @type {string}
	*/
	whiteName = null;
	/**
	* This property represents a PGN tag.
	* 
	* The name, username or nickname of the player(s) with the black pieces.
	* Real names should be given
	* as they would appear in a telephone directory (last names first). If unset,
	* a single question mark (`?`) will be used when exporting.
	* @type {string}
	*/
	blackName = null;
	/**
	* This property represents a PGN tag.
	* 
	* A string that describes the reason of the conclusion of the game. According to
	* the PGN specification, possible values are:
	* 
	* * `normal`: The game was terminated in a normal fashion (checkmate, draw).
	* * `abandoned`: The game was abandoned (the opponent resigned).
	* * `time forfeit`: The player did not meet time control requirements.
	* * `unterminated`: The game did not finish.
	* * `rules infraction`: The player didn't meet the event regulations (maybe lost
	* by double illegal move).
	* * `emergency`: Something happened.
	* * `adjudication`: The game was concluded due to third party reasons.
	* * `death`: Losing player called to better life, hopefully.
	* 
	* This property is not case sensitive: `Time Forfeit`, `TIME FORFEIT` and `time forfeit` do
	* all mean the same and are all possible values.
	* @type {string}
	*/
	termination = null;
	/**
	* The person or website who annotated the game. When exporting to PGN,
	* if the property is ignored, the value `bishops.js` will be used.
	*/
	annotator = null;
	/**
	* The white Elo rating of the white player, as a number. Used when exporting to PGN.
	* @type {number}
	*/
	whiteElo = null;
	/**
	* The black Elo rating of the white player, as a number. Used when exporting to PGN.
	* @type {number}
	*/
	blackElo = null;
	/**
	* The network address (website or e-mail) of the player with the white pieces.
	* @type {string}
	*/
	whiteNetworkAddress = null;
	/**
	* The network address (website or e-mail) of the player with the black pieces.
	* @type {string}
	*/
	blackNetworkAddress = null;
	/**
	* The time control of the game. Increments
	* are written with the plus symbol (`+`), e.g. `300+3`. Other values are possible,
	* according to the PGN specification. A hyphen (`-`) represents no time control.
	* When exporting or importing, a question mark (`?`) represents an unknown time control
	* and it is transversed into `null`.
	* @type {string}
	*/
	timeControl = null;
	/**
	* The FIDE title of the white player, e.g. `FM`, `IM`, `WGM`...
	* @type {string}
	*/
	whiteTitle = null;
	/**
	* The FIDE title of the black player, e.g. `FM`, `IM`, `WGM`...
	* @type {string}
	*/
	blackTitle = null;
	/**
	* Additional tag pairs that should be included when exporting to PGN,
	* as a map with a `tag` - `value` structure.
	* @type {Map}
	*/
	pgnAdditionalTagPairs = /* @__PURE__ */ new Map();
	/**
	* @readonly
	* This property represents a PGN tag.
	* 
	* (read-only) The result of the game as a string.
	* * `0-1`: Black wins
	* * `1-0`: White wins
	* * `1/2-1/2`: Drawn game
	* * `*`: Unfinished
	* 
	* It is the same as the game termination marker that concludes the PGN movetext.
	* This value is determined from the game.
	* @type {string}
	*/
	get pgnResult() {
		return [
			"*",
			"1-0",
			"0-1",
			"1/2-1/2"
		][this.result];
	}
	/**
	* @readonly
	* The result of the match as a number.
	* * `0`: Unfinished. The game might continue.
	* * `1`: White wins (either by checkmate or by opponent's resignation or disqualification).
	* * `2`: Black wins.
	* * `3`: Drawn game. (conventional draw, claimed draw, agreement draw)
	* For variants other than the main line, the value will always be the
	* real game result, behaving like the `gameResult` property.
	* @type {number}
	*/
	get result() {
		if (this.#activeBranch[this.#activeBranch.length - 1] == this.mainBranch) {
			if (this.#lastResult == 0) return this.gameResult;
			return this.#lastResult;
		} else return this.gameResult;
	}
	/**
	* @readonly
	* The result of the game as a number. **This property does NOT take into
	* account the final match result**. agreement draws, claimed draws and resignations
	* will never be taken into account. Dead positions do NOT account as claimed draws
	* but as automatic draws.
	* * `0`: Unfinished.
	* * `1`: White wins (checkmate).
	* * `2`: Black wins (checkmate).
	* * `3`: The game has been automatically drawn (stalemate, fivefold repetition, 
	* 75-move rule, dead position).
	* @type {number}
	*/
	get gameResult() {
		const branch = this.#activeBranch[this.#activeBranch.length - 1];
		if (branch == this.mainBranch) {
			console.log(this.#lastRealResult);
			if (this.#lastRealResult == -1 || this.#lastRealResult == 0) {
				this.#lastRealResult = 0;
				this.position.print();
				if (branch.repetitionCount >= 5) this.#lastResult = this.#lastRealResult = 3;
				else if (this.position.isCheckmate) {
					this.#lastResult = this.#lastRealResult = 2 - this.position.turn;
					console.log("checkmate!");
				} else if (this.position.isDraw) this.#lastResult = this.#lastRealResult = 3;
				else if (this.position.isWinning) this.#lastResult = this.#lastRealResult = 1 + this.position.turn;
			}
			return this.#lastRealResult;
		} else {
			if (this.#lastTmpResult == -1) {
				this.#lastTmpResult = 0;
				if (branch.repetitionCount >= 5) this.#lastTmpResult = 3;
				else if (this.position.isCheckmate) this.#lastTmpResult = 2 - this.position.turn;
				else if (this.position.isDraw) this.#lastTmpResult = 3;
				else if (this.position.isWinning) this.#lastTmpResult = 1 + this.position.turn;
			}
			return this.#lastTmpResult;
		}
	}
	/**
	* @readonly
	* Checks if it is possible to claim draw (dead positions do not 
	* account as claimable draws).
	* @type {boolean}
	*/
	get canClaimDraw() {
		return this.canClaimFiftyMoves || this.canClaimThreefoldRepetition;
	}
	/**
	* @readonly
	* `true` if it is possible to claim draw by 50 moves without
	* a pawn being moved or a piece being captured in any side (this is,
	* 100 half moves)
	* @type {boolean}
	*/
	get canClaimFiftyMoves() {
		if (this.position.halfMoveCount >= 100) return true;
		return false;
	}
	/**
	* @readonly
	* `true` if it is possible to claim draw by threefold repetition (the
	* same position, including castling and *en passant* rights, being repeated
	* at least three times).
	* @type {boolean}
	*/
	get canClaimThreefoldRepetition() {
		if (this.#activeBranch[this.#activeBranch.length - 1].repetitionCount >= 3) return true;
		return false;
	}
	/**
	* Claims draw automatically. Similar to `Game.terminate(3, 'normal')`, but this function will
	* throw an error if it is not possible to claim draw.
	*/
	claimDraw() {
		if (!this.canClaimDraw) throw new Error("Impossible to claim draw");
		this.terminate(3, "normal");
	}
	/**
	* Terminates the actual variation with a given result.
	* @param {number} result - The game result as a number (1 - white wins, 2 - black wins, 3 - draw).
	* **A value of `0` will reset the game termination**, allowing to modify abandoned games, but will not
	* overwrite checkmates, stalemates or forced draws (e.g. it will never override the FIDE Laws of Chess).
	* In that cases, the game will be re-terminated with the reglamentary (`game.gameResult`) value.
	* @param {string} [terminationCode] - The termination code as a string (e.g. `Time Forfeit`).
	*/
	terminate(result, terminationCode = null) {
		if (this.#activeBranch[this.#activeBranch.length - 1] == this.mainBranch) {
			if (result == 0) {
				if (this.#lastRealResult = -1) this.#lastResult = 0;
				else this.#lastResult = this.#lastRealResult;
				this.termination = terminationCode ?? "unterminated";
			} else {
				this.#lastResult = result;
				if (terminationCode) this.termination = terminationCode;
			}
		} else throw new Error("You can only terminate the main branch.");
	}
	/**
	* @readonly
	* Represents a PGN parser attached to this game.
	* @type {PGNParser}
	*/
	pgn = null;
	/**
	* `true` if the game starts from a custom position, likely a
	* FEN string.
	* @type {boolean}
	*/
	customPosition = false;
};
/**
* Represents a PGN parsing engine. Each game has its own
* inside the `pgn` property.
* 
*/
var PGNParser = class {
	/**
	* Builds a new PGN parser.
	* @param {Game} [game] - (Optional) The game to parse by default.
	*/
	constructor(game = null) {
		this.game = game;
	}
	/**
	* @type {string}
	* This property specifies how to run the thread.
	* * `blocking`: the thread will be blocked until the import finishes. Good for
	* debugging and quick tests.
	* * `lp` (low priority): the algorithm will share the same thread, but it'll give
	* priority to other scheduled tasks, helping not to block the UI. (asynchronous).
	* A `worker` thread mode might be available in the future.
	*/
	threadMode = "blocking";
	/**
	* Loads a PGN string to a `Game`. The Game will be cleaned and
	* its data will be replaced.
	* @param {string} pgn - The PGN to parse, as a string.
	* @param {Object} [options] - (Optional) Additional options when
	* parsing the game. Some options are:
	*  * `ruleSet`: (`Variant`) By default, this method chooses a new rule set based
	* on the `Variant` PGN header, if existing. This property, if set, 
	* overrides that setting and uses a custom rule set to parse the game.
	*  * `strict`: (boolean) Prefers the strict parser when parsing SAN notation.
	* This might be more performant for computer-exported PGN games that stick to
	* the PGN/SAN export specifications. It'll still use the general parser as a fallback
	* if the strict parser fails.
	*  * `threadMode`: (string) Overrides the thread mode general setting.
	*  * `debug`: (boolean) if `true`, prints all tokens to the console.
	* @param {Game} [game] - The game to parse. If ignored, the
	* game specified when the parser was created will be used.
	* @returns {Promise} A promise that finishes when the import finishes.
	* If `threadMode` is set to `blocking`, this method returns a resolved
	* promise.
	*/
	async import(pgn, options = null, game = this.game) {
		if (!game) throw new TypeError("No game selected.");
		game.clear();
		game._autoTerminate = false;
		let token = "";
		let result = -1;
		const headers = /* @__PURE__ */ new Map();
		const debug = false | options?.debug;
		const threadMode = options?.threadMode ?? this.threadMode;
		const empty = /\s/;
		const move = /^(?:[1-9][0-9]*\.*\s*)?[A-Za-z0-9\_\+\#\=\:\-]+[\?\!]*\)?\s$/;
		const tokenTerminations = /^[\s\]\}\)\(]$/;
		const nag = /^\$[0-9]+\s$/;
		const gameTerminationMarkers = /^(?:1-0|0-1|1\/2-1\/2|\*)\s$/;
		let section = "tagpair";
		pgn += "\n";
		let variantDepth = 0;
		let lineLock = false;
		const usingVariants = [];
		for (let n = 0; n < pgn.length; n++) {
			const c = pgn[n];
			if (c == "%" && (n == 0 || pgn[n - 1] == "\n")) lineLock = true;
			if (lineLock) {
				if (c == "\n") lineLock = false;
				continue;
			}
			token += c;
			if (empty.test(token) && token.length == 1) token = "";
			if (!tokenTerminations.test(c)) continue;
			if (section == "tagpair") {
				if (token[0] == "[" && token[token.length - 1] == "]") {
					if (debug) console.log("[HEADER]", token);
					token = token.substring(1, token.length - 1).trim();
					const separator = token.search("\"");
					let key = token.substring(0, separator).trim();
					let val = token.substring(separator).trim();
					val = val.substring(1, val.length - 1);
					headers.set(key, val);
					token = "";
					continue;
				}
			}
			if (section == "movetext") {
				if (token[0] == "{" && token[token.length - 1] == "}") {
					if (debug) console.log("[BRACKET]", token);
					token = token.substring(1, token.length - 1);
					let match;
					const regex = /\[%[^\[\]]*\]/g;
					while ((match = regex.exec(token)) !== null) {
						let m = match[0].substring(2, match[0].length - 1);
						const separator = m.search(empty);
						if (separator < 0) continue;
						const key = m.substring(0, separator);
						const value = m.substring(separator);
						if (!key || !value) continue;
						if (key == "clk") {
							const [h, m, s] = value.trim().split(":");
							game.position.move.clock = ((+h * 60 + +m) * 60 + +s) * 1e3;
						} else if (key == "eval") game.position.move.evaluation = value.trim().startsWith("#") ? value.trim() : +value;
					}
					const comment = token.replace(regex, "").trim();
					if (comment) game.position.move.comments.push(comment);
					token = "";
					continue;
				}
				if (token[0] == ";" && (token[token.length - 1] == "\r" || token[token.length - 1] == "\n")) {
					if (debug) console.log("[COMMENT]", token);
					token = "";
					continue;
				}
				if (token[0] == "(") {
					if (debug) console.log("[VARIANT_START]", token);
					const variant = game.createBranchAt(game.moveCount - 1);
					usingVariants.push(variant);
					game.useBranch(variant);
					token = "";
					variantDepth++;
					continue;
				}
				if (token[0] == ")") {
					if (debug) console.log("[VARIANT_FINISH]", token);
					usingVariants.pop();
					game.useBranch(usingVariants[usingVariants.length - 1] || game.mainBranch);
					token = "";
					variantDepth--;
					continue;
				}
				if (nag.test(token)) {
					if (debug) console.log("[NADJ]", token);
					token = "";
					continue;
				}
			}
			if (section) {
				if (gameTerminationMarkers.test(token)) {
					result = [
						"1-0",
						"0-1",
						"1/2-1/2"
					].indexOf(token.substring(0, token.length - 1));
					if (debug) console.log("[TERMINATE]", token);
					token = "";
					section = null;
					continue;
				}
				if (move.test(token)) {
					if (section == "tagpair") {
						game.site = null;
						game.pgnDate = null;
						game.round = null;
						game.whiteName = null;
						game.blackName = null;
						game.pgnAdditionalTagPairs = /* @__PURE__ */ new Map();
						let fen;
						for (const [key, value] of headers) switch (key.toLowerCase()) {
							case "event":
								if (value == "?") game.event = null;
								else game.event = value;
								break;
							case "site":
								if (value == "?") game.site = null;
								else game.site = value;
								break;
							case "date":
								if (value == "????.??.??") game.pgnDate = null;
								else game.pgnDate = value;
								break;
							case "round":
								if (value == "-") game.round = null;
								else game.round = value;
								break;
							case "white":
								if (value == "?") game.whiteName = null;
								else game.whiteName = value;
								break;
							case "black":
								if (value == "?") game.blackName = null;
								else game.blackName = value;
								break;
							case "result":
								result = [
									"1-0",
									"0-1",
									"1/2-1/2"
								].indexOf(value);
								break;
							case "annotator":
								game.annotator = value;
								break;
							case "whitetitle":
								if (value == "-") game.whiteTitle = null;
								else game.whiteTitle = value;
								break;
							case "blacktitle":
								if (value == "-") game.blackTitle = null;
								else game.blackTitle = value;
								break;
							case "whiteelo":
								if (value == "-") game.whiteElo = null;
								else game.whiteElo = +value;
								break;
							case "blackelo":
								if (value == "-") game.blackElo = null;
								else game.blackElo = +value;
								break;
							case "whitena":
								if (value == "-") game.whiteNetworkAddress = null;
								else game.whiteNetworkAddress = value;
								break;
							case "blackna":
								if (value == "-") game.blackNetworkAddress = null;
								else game.blackNetworkAddress = value;
								break;
							case "time":
								if (value == "??:??:??") game.pgnTime = null;
								else time = value;
								break;
							case "utctime":
								if (value == "??:??:??") game.pgnUTCTime = null;
								else game.pgnUTCTime = value;
								break;
							case "utcdate":
								if (value == "????.??.??") game.pgnUTCDate = null;
								else game.pgnUTCDate = value;
								break;
							case "setup":
								if (value == "1") {}
								break;
							case "fen":
								fen = value;
								break;
							case "termination":
								game.termination = value;
								break;
							case "timecontrol":
								if (value == "?") game.timeControl = null;
								else game.timeControl = value;
								break;
							default: game.pgnAdditionalTagPairs.set(key, value);
						}
						if (fen) game.begin(fen);
						else game.begin();
					}
					const original = token;
					if (debug) console.log("[MOVE]", token);
					token = token.trim();
					let decreaseVariant = false;
					if (token.endsWith(")")) {
						token = token.substring(0, token.length - 1);
						decreaseVariant = true;
					}
					const move = token.split(/\s+/)[1] || token;
					try {
						game.move(move);
						if (threadMode == "lp") await new Promise((r) => setTimeout(r));
					} catch (e) {
						const splitPos = original.substring(0, original.length - 1).search(/[^ ]*$/) + 1;
						const off = n - (original.length - splitPos);
						const before = pgn.substring(Math.max(off - 30, 0), off);
						const error = pgn.substring(off, n);
						const after = pgn.substring(n, Math.min(n + 30, pgn.length));
						game.clear();
						game._autoTerminate = true;
						throw new Error("Can't parse the following movement:\n\n..." + before + ">>>" + error + "<<<" + after + "...\n\nGot: " + e);
					}
					if (decreaseVariant) {
						variantDepth--;
						usingVariants.pop();
						game.useBranch(usingVariants[usingVariants.length - 1] || game.mainBranch);
					}
					token = "";
					section = "movetext";
					continue;
				}
			}
		}
		if (game.position.isGameOver) game.terminate(game.position.isWinning ? game.position.turn ? 2 : 1 : game.position.isCheckmate ? game.position.turn ? 1 : 2 : 3);
		else game.terminate(result + 1);
	}
	/**
	* Exports a game to a PGN string.
	* @param {Object} options - How should the output PGN be.
	* @param {Game} game
	*/
	async export(options = {}, game) {
		game = game ?? this.game;
		game.useBranch(game.mainBranch);
		/**
		* 
		* @param {Branch} branch 
		*/
		let outLen = 0;
		const maxCol = options?.colSizeLimit ?? 80;
		const includeMoveNotation = options.format !== "column" && (options?.includeMoveNotation ?? true);
		function writeBranch(branch) {
			console.log("Writing", branch.children.length);
			let lastNum = false;
			const children = branch.children.toSorted((a, b) => {
				return a.countStart - b.countStart;
			});
			let output = "";
			for (const i in branch.moves) {
				const n = +i + branch.countStart;
				let chunk = "";
				if (n % 2 == 0) {
					chunk += n / 2 + 1;
					chunk += ".";
					if (options.format == "column") chunk += " ".repeat(Math.max(5 - chunk.length, 1));
					lastNum = true;
				} else if (!lastNum) {
					chunk += (n - 1) / 2 + 1;
					chunk += "...";
					if (options.format == "column") chunk += " ".repeat(Math.max(11 - chunk.length, 1));
				}
				if (options.format !== "column" && chunk.length) {
					outLen += chunk.length + 1;
					if (outLen > maxCol) {
						chunk = "\n" + chunk + " ";
						outLen = chunk.length + 1;
					} else chunk += " ";
					output += chunk;
					chunk = "";
				}
				chunk += branch.moves[i].san;
				if (options.format == "column") {
					if (n % 2 == 1) chunk += "\n";
					else chunk += " ".repeat(Math.max(6 - branch.moves[i].san.length, 1));
				} else {
					outLen += chunk.length + 1;
					if (outLen > maxCol) {
						chunk = "\n" + chunk + " ";
						outLen = chunk.length + 1;
					} else chunk += " ";
				}
				output += chunk;
				chunk = "";
				if (includeMoveNotation) {
					chunk += "{ ";
					if (typeof branch.moves[i].evaluation == "number" || typeof branch.moves[i].evaluation == "string") chunk += "[%eval " + branch.moves[i].evaluation + "] ";
					if (typeof branch.moves[i].clock == "number") chunk += "[%clk " + new Date(branch.moves[i].clock).toISOString().substring(11, 19) + "] ";
					chunk += "}";
					if (chunk !== "{ }") {
						lastNum = false;
						outLen += chunk.length + 1;
						if (outLen > maxCol) {
							chunk = "\n" + chunk + " ";
							outLen = chunk.length + 1;
						} else chunk += " ";
						output += chunk;
						chunk = "";
					}
				}
				if (branch.moves[i].comments?.length) {
					lastNum = false;
					if (options.format == "column") {
						chunk = "";
						if (n % 2 == 0) chunk += "\n";
						for (const comment of branch.moves[i].comments) if (options.comment == "bracket") for (const line of comment.split("\n")) {
							chunk += "{ ";
							chunk += line;
							chunk += " }";
							chunk += "\n";
						}
						else {
							chunk += "; ";
							chunk += comment;
							chunk += "\n";
						}
						output += chunk;
					} else {
						chunk = "";
						for (const comment of branch.moves[i].comments) {
							chunk += "{ ";
							chunk += comment;
							chunk += " }";
							outLen += chunk.length + 1;
							if (outLen > maxCol) {
								chunk = "\n" + chunk + " ";
								outLen = chunk.length + 1;
							} else chunk += " ";
							output += chunk;
							chunk = "";
						}
					}
				}
				if (children.length && children[0].countStart == branch.countStart + +i) {
					if (options.format == "column") {
						if (n % 2 == 0) output += "\n";
						output += "(\n";
						output += writeBranch(children[0]);
						if (output.endsWith("\n")) output = output.substring(0, output.length - 1);
						output += "\n)\n";
						children.shift();
						lastNum = false;
					} else {
						chunk = "(";
						outLen += chunk.length;
						if (outLen > maxCol) {
							chunk = "\n" + chunk;
							outLen = chunk.length;
						}
						output += chunk;
						output += writeBranch(children[0]).trim();
						chunk = ")";
						outLen += chunk.length + 1;
						if (outLen > maxCol) {
							chunk = "\n" + chunk + " ";
							outLen = chunk.length + 1;
						} else chunk += " ";
						output += chunk;
					}
				}
			}
			return output;
		}
		let output = "";
		output += `[Event "${game.event ?? "?"}"]\n`;
		output += `[Site "${game.site ?? "?"}"]\n`;
		output += `[Date "${game.pgnDate ?? "????.??.??"}"]\n`;
		output += `[Round "${game.round ?? "-"}"]\n`;
		output += `[White "${game.whiteName ?? "?"}"]\n`;
		output += `[Black "${game.blackName ?? "?"}"]\n`;
		output += `[Result "${game.pgnResult}"]\n`;
		if (game.pgnUTCDate) output += `[UTCDate "${game.pgnUTCDate}"]\n`;
		if (game.pgnUTCTime) output += `[UTCTime "${game.pgnUTCTime}"]\n`;
		if (game.pgnTime) output += `[Time "${game.pgnTime}"]\n`;
		if (game.whiteElo) output += `[WhiteElo "${game.whiteElo}"]\n`;
		if (game.blackElo) output += `[BlackElo "${game.blackElo}"]\n`;
		if (game.whiteTitle) output += `[WhiteTitle "${game.whiteTitle}"]\n`;
		if (game.blackTitle) output += `[BlackTitle "${game.whiteTitle}"]\n`;
		if (game.whiteNetworkAddress) output += `[WhiteNA "${game.whiteNetworkAddress}"]\n`;
		if (game.blackNetworkAddress) output += `[BlackNA "${game.blackNetworkAddress}"]\n`;
		if (game.timeControl) output += `[TimeControl "${game.timeControl}"]\n`;
		if (game.termination) output += `[Termination "${game.termination}"]\n`;
		if (game.customPosition) output += `[SetUp "1"]\n[FEN "${game.initialPosition.fen}"]\n`;
		if (game.annotator) output += `[Annotator "${game.annotator}"]\n`;
		else output += `[Annotator "bishops.js"]\n`;
		if (game.pgnAdditionalTagPairs) for (const [key, value] of game.pgnAdditionalTagPairs) output += `[${key} "${value}"]\n`;
		output += "\n";
		output += writeBranch(game.mainBranch);
		if (options.format == "column") output += "\n" + game.pgnResult;
		else {
			let chunk = game.pgnResult;
			outLen += chunk.length + 1;
			if (outLen > maxCol) {
				chunk = "\n" + chunk + " ";
				outLen = chunk.length + 1;
			} else chunk += " ";
			output += chunk;
		}
		return output;
	}
};
//#endregion
export { Branch, Game, Move, PGNParser, PIECES, Position, PositionView, StandardVariant, Variant, nts, numberToSquare, squareToNumber, stn };
