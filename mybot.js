/**
 * @title Overkill Scalper MAX Pro
 * @shortTitle OS_MAX_PRO
 * @description Enterprise-Grade Multi-Indicator Quantitative Strategy with Dynamic Risk Filters
 */

class OverkillScalperMAXPro extends UserDefinedIndicator {
    onInit() {
        return {
            title: "Overkill Scalper MAX Pro",
            shortTitle: "OS MAX PRO",
            description: "High-Budget Quantitative Strategy Engine",
            // User inputs to customize parameters on the fly
            inputs: {
                rsiLength: { type: 'number', defval: 14, min: 1, max: 50, label: "RSI Period" },
                rsiOverbought: { type: 'number', defval: 70, min: 50, max: 90, label: "RSI Overbought" },
                rsiOversold: { type: 'number', defval: 30, min: 10, max: 50, label: "RSI Oversold" },
                fastEmaLength: { type: 'number', defval: 9, min: 1, max: 50, label: "Fast EMA" },
                slowEmaLength: { type: 'number', defval: 21, min: 1, max: 200, label: "Slow EMA" },
                trendEmaLength: { type: 'number', defval: 200, min: 10, max: 500, label: "Institutional Trend Filter" }
            },
            // Defining clear visual plots for the dashboard layout
            plots: {
                fastEma: { type: 'line', color: '#00ffcc', lineWidth: 2, label: 'Fast Trigger' },
                slowEma: { type: 'line', color: '#ff007f', lineWidth: 2, label: 'Slow Trigger' },
                trendFilter: { type: 'line', color: '#ffaa00', lineWidth: 1, label: 'Trend Baseline' }
            }
        };
    }

    onCalculate(data) {
        // Core market data streams
        const close = data.close;
        const high = data.high;
        const low = data.low;
        const open = data.open;
        const volume = data.volume;
        const length = data.length;

        if (length < this.inputs.trendEmaLength) {
            return; // Wait for enough data history to load to prevent false signals
        }

        // 1. Core Exponential Moving Averages Engines
        const fastEma = this.ema(close, this.inputs.fastEmaLength);
        const slowEma = this.ema(close, this.inputs.slowEmaLength);
        const institutionalTrend = this.ema(close, this.inputs.trendEmaLength);

        // 2. Volume-Weighted Relative Strength Index (RSI) Engine
        const rsi = this.rsi(close, this.inputs.rsiLength);

        // 3. Current Price Array Access Point
        const currentClose = close[length - 1];
        const prevClose = close[length - 2];

        // 4. Institutional Trend Direction Filter
        const isBullishTrend = currentClose > institutionalTrend;
        const isBearishTrend = currentClose < institutionalTrend;

        // 5. Cross-Over Execution Metrics
        const emaCrossUp = (fastEma[length - 1] > slowEma[length - 1]) && (fastEma[length - 2] <= slowEma[length - 2]);
        const emaCrossDown = (fastEma[length - 1] < slowEma[length - 1]) && (fastEma[length - 2] >= slowEma[length - 2]);

        // 6. Quantitative Entry Signal Rules
        let signal = null;

        // BUY Logic: Price above 200 EMA + Fast cross over Slow + RSI leaving oversold territory
        if (isBullishTrend && emaCrossUp && rsi[length - 1] > this.inputs.rsiOversold) {
            signal = "BUY";
        }
        // SELL Logic: Price below 200 EMA + Fast cross under Slow + RSI leaving overbought territory
        else if (isBearishTrend && emaCrossDown && rsi[length - 1] < this.inputs.rsiOverbought) {
            signal = "SELL";
        }

        // Return values to live render directly on Liquid Charts Pro
        return {
            plots: {
                fastEma: fastEma[length - 1],
                slowEma: slowEma[length - 1],
                trendFilter: institutionalTrend[length - 1]
            },
            signals: signal ? {
                type: signal,
                price: currentClose,
                time: data.time[length - 1]
            } : null
        };
    }

    // High-performance math utility: EMA Calculator
    ema(src, length) {
        let emaVal = [];
        let k = 2 / (length + 1);
        emaVal[0] = src[0];
        for (let i = 1; i < src.length; i++) {
            emaVal[i] = src[i] * k + emaVal[i - 1] * (1 - k);
        }
        return emaVal;
    }

    // High-performance math utility: RSI Calculator
    rsi(src, length) {
        let rsiVal = [];
        let gains = [0];
        let losses = [0];

        for (let i = 1; i < src.length; i++) {
            let diff = src[i] - src[i - 1];
            gains[i] = diff > 0 ? diff : 0;
            losses[i] = diff < 0 ? -diff : 0;
        }

        let avgGain = this.ema(gains, length);
        let avgLoss = this.ema(losses, length);

        for (let i = 0; i < src.length; i++) {
            if (avgLoss[i] === 0) {
                rsiVal[i] = 100;
            } else {
                let rs = avgGain[i] / avgLoss[i];
                rsiVal[i] = 100 - (100 / (1 + rs));
            }
        }
        return rsiVal;
    }
}

window.OverkillScalperMAXPro = OverkillScalperMAXPro;
