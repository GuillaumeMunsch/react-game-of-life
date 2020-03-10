import React, { PureComponent } from 'react';
import './App.css';

interface Props {}
interface State {
    headerHeight: number;
    width: number;
    height: number;
    squareSize: number;
    map: boolean[][];
}

class App extends PureComponent<Props, State> {
    constructor(props: Props) {
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
        console.log('Map', this.state.map);
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
        const x = e.pageX;
        const y = e.pageY - this.state.headerHeight;
        console.log('x', x);
        console.log('y', y);
    };

    drawGrid = (): void => {
        const canvas: any = this.refs.canvas;
        canvas.addEventListener('mousedown', this.onCanvasPress, false);
        const ctx = canvas.getContext('2d');
        for (let i = 0; i < this.state.width; i += this.state.squareSize) {
            // Drawing grid
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.state.height);
            ctx.moveTo(0, i);
            ctx.lineTo(this.state.width, i);
        }
        for (let x = 0; x < this.state.map.length; x++) {
            for (let y = 0; y < this.state.map[x].length; y++) {
                const elem = this.state.map[x][y];
                if (elem) {
                    console.log('Elem', elem, x, y);

                    ctx.fillRect(
                        x * this.state.squareSize,
                        y * this.state.squareSize,
                        this.state.squareSize,
                        this.state.squareSize,
                    );
                }
            }
        }
        ctx.stroke();
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
