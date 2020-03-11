import React, { PureComponent } from 'react';
import './App.css';

const DEFAULT_ROUND_TIME_VALUE = 200; // ms
const DEFAULT_SQUARE_SIZE_VALUE = 30;

interface State {
    headerHeight: number;
    width: number;
    height: number;
    squareSize: number;
    map: boolean[][];
    canvasContext?: any;
    running: boolean;
    roundTime: number;
}

const createMap = (width: number, height: number, squareSize: number): boolean[][] =>
    [...Array(Math.ceil(width / squareSize))].map((_, x) =>
        [...Array(Math.ceil(height / squareSize))].map((elem, y) => false),
    );

const getDefaultState = (): State => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height,
        headerHeight: 60,
        squareSize: DEFAULT_SQUARE_SIZE_VALUE,
        map: createMap(width, height, DEFAULT_SQUARE_SIZE_VALUE),
        running: false,
        roundTime: DEFAULT_ROUND_TIME_VALUE,
    };
};

class App extends PureComponent<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = getDefaultState();
    }
    componentDidMount(): void {
        window.addEventListener('resize', this.updateWindowDimensions);
        this.drawGrid();
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = (): void => {
        this.setState({ width: window.innerWidth, height: window.innerHeight }, this.drawGrid);
    };

    onCanvasPress = (e: any): void => {
        const x = Math.floor(e.pageX / this.state.squareSize);
        const y = Math.floor((e.pageY - this.state.headerHeight) / this.state.squareSize);
        const map = [...this.state.map.map(row => [...row])];
        map[x][y] = !map[x][y];
        if (map[x][y])
            this.state.canvasContext.fillRect(
                x * this.state.squareSize,
                y * this.state.squareSize,
                this.state.squareSize,
                this.state.squareSize,
            );
        else
            this.state.canvasContext.clearRect(
                x * this.state.squareSize + 1,
                y * this.state.squareSize + 1,
                this.state.squareSize - 1,
                this.state.squareSize - 1,
            );
        this.setState({ map });
    };

    drawGrid = (reset = false): void => {
        let canvasContext: any;
        if (this.state.canvasContext) {
            canvasContext = this.state.canvasContext;
        } else {
            const canvas: any = this.refs.canvas;
            canvas.addEventListener('mousedown', this.onCanvasPress, false);
            canvasContext = canvas.getContext('2d');
        }
        canvasContext.beginPath();
        if (reset) {
            console.log('On clear');
            canvasContext.clearRect(0, 0, 500, 500);
        }
        for (let i = 0; i < this.state.width; i += this.state.squareSize) {
            // Drawing grid
            canvasContext.moveTo(i, 0);
            canvasContext.lineTo(i, this.state.height);
            canvasContext.moveTo(0, i);
            canvasContext.lineTo(this.state.width, i);
        }
        for (let x = 0; x < this.state.map.length; x++) {
            for (let y = 0; y < this.state.map[x].length; y++) {
                const elem = this.state.map[x][y];
                if (elem) {
                    canvasContext.fillRect(
                        x * this.state.squareSize,
                        y * this.state.squareSize,
                        this.state.squareSize,
                        this.state.squareSize,
                    );
                } else {
                    canvasContext.clearRect(
                        x * this.state.squareSize + 1,
                        y * this.state.squareSize + 1,
                        this.state.squareSize - 1,
                        this.state.squareSize - 1,
                    );
                }
            }
        }
        canvasContext.stroke();
        this.setState({ canvasContext });
    };

    updateCell = (x: number, y: number, map: boolean[][]): boolean => {
        let neighbourCount = 0;
        if (x - 1 >= 0 && y - 1 >= 0 && map[x - 1][y - 1]) neighbourCount++; // Top left
        if (y - 1 >= 0 && map[x][y - 1]) neighbourCount++; // Top
        if (x + 1 < map.length && y - 1 >= 0 && map[x + 1][y - 1]) neighbourCount++; // Top right
        if (x - 1 >= 0 && map[x - 1][y]) neighbourCount++; // Left
        if (x + 1 < map.length && map[x + 1][y]) neighbourCount++; // Right
        if (x - 1 >= 0 && y + 1 <= map[x].length && map[x - 1][y + 1]) neighbourCount++; // Bottom left
        if (y + 1 <= map[x].length && map[x][y + 1]) neighbourCount++; // Bottom
        if (x + 1 < map.length && y + 1 <= map[x].length && map[x + 1][y + 1]) neighbourCount++; // Bottom right
        if (map[x][y]) {
            // Cell alive for now
            return neighbourCount === 2 || neighbourCount === 3;
        }
        // No cell for now
        return neighbourCount === 3;
    };

    startAndStopGame = (): void => {
        if (this.state.running) {
            setTimeout(() => {
                const newMap = [...this.state.map.map(row => [...row])];
                for (let x = 0; x < newMap.length; x++)
                    for (let y = 0; y < newMap[x].length; y++)
                        newMap[x][y] = this.updateCell(x, y, this.state.map);
                this.setState({ map: newMap }, () => {
                    this.drawGrid();
                    this.startAndStopGame();
                });
            }, this.state.roundTime);
        }
    };

    render() {
        return (
            <div className="App">
                <div
                    style={{
                        height: this.state.headerHeight,
                        backgroundColor: 'coral',
                        flexDirection: 'row',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div className="header-item">
                        <button
                            onClick={(): void =>
                                this.setState({ running: !this.state.running }, () =>
                                    this.startAndStopGame(),
                                )
                            }
                        >
                            {this.state.running ? 'Stop' : 'Start'}
                        </button>
                    </div>
                    <div className="header-item">
                        <span>Time (in ms): </span>
                        <input
                            disabled={this.state.running}
                            type="text"
                            value={this.state.roundTime}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                let roundTime = parseInt(e.target.value);
                                if (isNaN(roundTime)) roundTime = DEFAULT_ROUND_TIME_VALUE;
                                this.setState({ roundTime });
                            }}
                        />
                    </div>
                    <div className="header-item">
                        <span>Square size (in px): </span>
                        <input
                            disabled={this.state.running}
                            type="number"
                            value={this.state.squareSize}
                            min="10"
                            max="100"
                            step="5"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                let squareSize = parseInt(e.target.value);
                                if (isNaN(squareSize)) squareSize = DEFAULT_SQUARE_SIZE_VALUE;
                                else if (
                                    squareSize < 10 ||
                                    squareSize > 100 ||
                                    squareSize % 5 !== 0
                                )
                                    squareSize = this.state.squareSize;
                                this.setState(
                                    {
                                        squareSize,
                                        map: createMap(
                                            this.state.width,
                                            this.state.height,
                                            squareSize,
                                        ),
                                    },
                                    () => this.drawGrid(true),
                                );
                            }}
                        />
                    </div>
                    <div className="header-item">
                        <button
                            disabled={this.state.running}
                            onClick={(): void => {
                                const newMap = [...this.state.map.map(row => [...row])];
                                for (let x = 0; x < newMap.length; x++)
                                    for (let y = 0; y < newMap[x].length; y++) {
                                        const value = Math.floor(Math.random() * 10) % 9 === 0;
                                        newMap[x][y] = value;
                                    }
                                console.log(newMap);
                                this.setState({ map: newMap }, () => this.drawGrid(true));
                            }}
                        >
                            Random fill
                        </button>
                    </div>
                    <div className="header-item">
                        <button
                            disabled={this.state.running}
                            onClick={(): void =>
                                this.setState(getDefaultState(), () => this.drawGrid(true))
                            }
                        >
                            Clear
                        </button>
                    </div>
                </div>
                <canvas
                    ref="canvas"
                    width={this.state.width}
                    height={this.state.height - this.state.headerHeight}
                />
            </div>
        );
    }
}

export default App;
