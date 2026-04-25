import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_percentage_error
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import time

# Fetch stock data
def get_stock_data(ticker, period="1y"):
    stock = yf.Ticker(ticker)
    data = stock.history(period=period)
    data['Date'] = data.index
    data['Date'] = pd.to_datetime(data['Date'])
    return data

# Fetch options data
def get_options_data(ticker):
    stock = yf.Ticker(ticker)
    options = stock.options
    if options:
        expiry = options[0]  # Use the first available expiry date
        options_chain = stock.option_chain(expiry)
        calls = options_chain.calls
        puts = options_chain.puts
        return calls, puts
    return pd.DataFrame(), pd.DataFrame()

# Add technical indicators
def add_technical_indicators(data):
    data['SMA_20'] = data['Close'].rolling(window=20).mean()
    data['SMA_50'] = data['Close'].rolling(window=50).mean()
    
    delta = data['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['RSI'] = 100 - (100 / (1 + rs))
    
    data['BB_middle'] = data['Close'].rolling(window=20).mean()
    data['BB_std'] = data['Close'].rolling(window=20).std()
    data['BB_upper'] = data['BB_middle'] + (2 * data['BB_std'])
    data['BB_lower'] = data['BB_middle'] - (2 * data['BB_std'])
    
    return data.dropna()

# Add candlestick patterns
def add_candlestick_patterns(data):
    data['Doji'] = (abs(data['Close'] - data['Open']) / (data['High'] - data['Low']) < 0.1).astype(int)
    data['Hammer'] = ((data['Close'] > data['Open']) &
                      ((data['Low'] - data['Open']) / (data['High'] - data['Low']) > 0.5)).astype(int)
    return data

# News sentiment analysis
def get_news_sentiment(ticker):
    analyzer = SentimentIntensityAnalyzer()
    # Placeholder for news headlines (replace with API or scraper data)
    news = [
        "Positive earnings report drives stock higher.",
        "Regulatory concerns weigh on the stock.",
        "Analysts upgrade stock outlook."
    ]
    sentiment_scores = [analyzer.polarity_scores(article) for article in news]
    avg_sentiment = np.mean([score['compound'] for score in sentiment_scores])
    return avg_sentiment

# Prepare data for training
def prepare_data(data, sentiment_score):
    data['Date_ordinal'] = data['Date'].map(pd.Timestamp.toordinal)
    data['Sentiment'] = sentiment_score
    features = data[['Date_ordinal', 'Volume', 'SMA_20', 'SMA_50', 'RSI', 'BB_upper', 'BB_middle', 'BB_lower',
                     'Doji', 'Hammer', 'Sentiment']]
    target = data['Close']
    return features, target

# Train the model
def train_model(features, target):
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    r2 = r2_score(y_test, predictions)
    mape = mean_absolute_percentage_error(y_test, predictions)
    print(f"Model trained with R²: {r2:.4f}, MAPE: {mape:.4f}")
    return model

# Main function
def main():
    ticker = "SOFI"
    print(f"Fetching data for {ticker}...")

    while True:
        # Fetch stock data
        data = get_stock_data(ticker)
        
        # Fetch options data
        calls, puts = get_options_data(ticker)

        # Add technical indicators and candlestick patterns
        data = add_technical_indicators(data)
        data = add_candlestick_patterns(data)

        # Analyze news sentiment
        sentiment_score = get_news_sentiment(ticker)

        # Prepare data
        features, target = prepare_data(data, sentiment_score)

        # Train model
        model = train_model(features, target)

        # Predict future prices
        last_row = features.iloc[-1].values
        prediction = model.predict([last_row])[0]

        # Display predictions
        print(f"\nPredicted stock price for {ticker}: {prediction}")
        print(f"Options Calls (Top 5):\n{calls.head()}")
        print(f"Options Puts (Top 5):\n{puts.head()}")
        print(f"News Sentiment Score: {sentiment_score}\n")

        print("Waiting 5 minutes before fetching new data...\n")
        time.sleep(300)

if __name__ == "__main__":
    main()
