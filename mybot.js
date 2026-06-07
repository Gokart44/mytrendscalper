/**
 * @title Overkill Scalper MAX V2
 * @description High-Performance Geometric Trend Engine
 */

class OverkillScalperMAX {
    constructor() {
        this.name = "Overkill Scalper MAX V2";
    }

    // This is the core function most web-charts call to map lines
    calculate(bars) {
        if (!bars || bars.length < 50) return [];

        let resultPlots = [];
        
        // 1. Calculate Fast and Slow EMAs directly
        let fastEma = this.computeEMA(bars.map(b => b.close), 9);
        let slowEma = this.computeEMA(bars.map(b => b.close), 21);
        let trendFilter = this.computeEMA(bars.map(b => b.close), 50);

        for (let i = 0; i < bars.length; i++) {
            let currentClose = bars[i].close;
            let signal = null;

            // N-Shape Uptrend: Fast crosses over Slow while above the main trend line
            if (fastEma[i] > slowEma[i] && fastEma[i-1] <= slowEma[i-1] && currentClose > trendFilter[i]) {
                signal = "BUY";
            } 
            // M-Shape Downtrend: Fast crosses under Slow while below the main trend line
            else if (fastEma[i] < slowEma[i] && fastEma[i-1] >= slowEma[i-1] && currentClose < trendFilter[i]) {
                signal = "SELL";
            }

            resultPlots.push({
                time: bars[i].time,
                fast: fastEma[i],
                slow: slowEma[i],
                trend: trendFilter[i],
                signal: signal
            });
        }

        return resultPlots;
    }

    computeEMA(data, period) {
        let ema = [];
        let k = 2 / (period + 1);
        ema[0] = data[0];
        for (let i = 1; i < data.length; i++) {
            ema[i] = data[i] * k + ema[i - 1] * (1 - k);
        }
        return ema;
    }
}

// Export it globally so the platform compiler grabs it immediately
window.OverkillScalperMAX = OverkillScalperMAX;

