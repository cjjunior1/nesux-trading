import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Generate upward trending candlestick data
np.random.seed(42)
dates = pd.date_range(start='2024-01-01', periods=60, freq='D')

# Create upward trending prices
base_price = 100
trend = np.linspace(0, 50, 60)  # Upward trend
noise = np.random.randn(60) * 2

close_prices = base_price + trend + noise
open_prices = close_prices - np.random.randn(60) * 1.5
high_prices = np.maximum(open_prices, close_prices) + np.abs(np.random.randn(60) * 2)
low_prices = np.minimum(open_prices, close_prices) - np.abs(np.random.randn(60) * 2)

# Create candlestick chart
fig = go.Figure(data=[go.Candlestick(
    x=dates,
    open=open_prices,
    high=high_prices,
    low=low_prices,
    close=close_prices,
    increasing_line_color='#00ff88',  # Bright green for bullish candles
    decreasing_line_color='#ff4444',  # Red for bearish candles
    increasing_fillcolor='#00ff88',
    decreasing_fillcolor='#ff4444',
)])

# Dark professional theme
fig.update_layout(
    plot_bgcolor='#0a0e1a',  # Dark blue background
    paper_bgcolor='#0a0e1a',
    font=dict(color='#ffffff', size=14),
    xaxis=dict(
        gridcolor='#1a2332',
        showgrid=True,
        rangeslider=dict(visible=False)
    ),
    yaxis=dict(
        gridcolor='#1a2332',
        showgrid=True
    ),
    margin=dict(l=50, r=50, t=50, b=50),
    width=1920,
    height=1080
)

# Save as high-quality image
fig.write_image('success-chart.jpg', format='jpg', scale=2)
print("Chart created successfully!")
