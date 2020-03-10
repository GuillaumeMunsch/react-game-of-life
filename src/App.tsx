import React, { PureComponent } from 'react';
import './App.css';

interface State {
    headerHeight: number;
    width: number;
    height: number;
    squareSize: number;
    map: boolean[][];
    canvasContext?: any;
}

class App extends PureComponent<{}, State> {
    constructor(props: {}) {
        super(props);
        const { innerWidth: width, innerHeight: height } = window;
        const squareSize = 200;
        this.state = {
            width,
            height,
            headerHeight: 60,
            squareSize,
            map: [...Array(Math.ceil(width / squareSize))].map((_, x) =>
                [...Array(Math.ceil(height / squareSize))].map((elem, y) => (x + y) % 2 === 0),
            ),
        };
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
        const map = this.state.map;
        map[x][y] = !map[x][y];
        if (map[x][y])
            this.state.canvasContext.fillRect(
                x * this.state.squareSize,
                y * this.state.squareSize,
                this.state.squareSize - 1,
                this.state.squareSize - 1,
            );
        else
            this.state.canvasContext.clearRect(
                x * this.state.squareSize,
                y * this.state.squareSize,
                this.state.squareSize - 1,
                this.state.squareSize - 1,
            );
        this.setState({ map });
    };

    drawGrid = (): void => {
        const canvas: any = this.refs.canvas;
        canvas.addEventListener('mousedown', this.onCanvasPress, false);
        const canvasContext = canvas.getContext('2d');
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
                    console.log('Elem', elem, x, y);

                    canvasContext.fillRect(
                        x * this.state.squareSize,
                        y * this.state.squareSize,
                        this.state.squareSize,
                        this.state.squareSize,
                    );
                }
            }
        }
        canvasContext.stroke();
        this.setState({ canvasContext });
    };

    render() {
        return (
            <div className="App">
                <div style={{ height: this.state.headerHeight, backgroundColor: 'orange' }}>Header</div>
                <canvas
                    ref="canvas"
                    width={this.state.width}
                    height={this.state.height - this.state.headerHeight}
                ></canvas>
            </div>
        );
    }
}

export default App;
