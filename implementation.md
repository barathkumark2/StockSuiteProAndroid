# Implementation Plan: StockSuitePro Native Android (Kotlin)

This document outlines the plan to convert the existing React Native StockSuitePro app into a native Android application using Kotlin and Jetpack Compose.

## 1. Technical Stack
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM (Model-View-ViewModel)
- **Navigation**: Jetpack Compose Navigation
- **Local Storage**: 
    - **Room Database**: For structured data like Portfolio Positions and Tranches.
    - **DataStore**: For simple key-value pairs like Global Settings (Theme, Currency, Decimals).
- **Dependency Injection**: Hilt (for managing ViewModels and Repositories).
- **Icons**: Material Icons / Lucide Android (or similar).
- **Haptics**: Android Vibrator API.

## 2. Project Structure
```text
com.stocksuitepro
├── data
│   ├── local
│   │   ├── dao (Room DAOs)
│   │   ├── entities (Room Entities)
│   │   └── AppDatabase.kt
│   ├── pref (DataStore for settings)
│   └── repository (Abstraction layer for UI)
├── ui
│   ├── theme (Color, Type, Shape, Theme)
│   ├── components (Reusable UI components: StatCard, NumericInput, etc.)
│   ├── navigation (Navigation Graph and Routes)
│   └── screens
│       ├── portfolio
│       ├── stockaverage
│       ├── profitloss
│       ├── lossrecovery
│       ├── targetaverage
│       └── settings
├── util (Formatters, Haptics helper)
└── MainActivity.kt
```

## 3. Key Components to Implement

### A. Data Models
Mirroring the TypeScript interfaces:
- `Tranche`: `id`, `buyPrice`, `quantity`.
- `PortfolioPosition`: `id`, `symbol`, `qty`, `avgPrice`, `cmp`.
- `Settings`: `currency`, `theme`, `decimals`.

### B. UI Components
- **NumericInput**: A custom TextField that handles numeric input with optional labels.
- **StatCard**: Displays a label and a value with optional color coding.
- **SectionCard**: A card container for grouping related fields.
- **AppBottomBar**: Navigation bar for switching between screens.

### C. Screens
1. **Stock Average Screen**: Multi-tranche calculator with dynamic row addition/removal. Persists a list of `Tranche` objects.
2. **Profit/Loss Screen**: Standard calculator for P&L. Includes a "Reverse Mode" to calculate required sell price for a target profit, and optional brokerage fee calculations.
3. **Loss Recovery Screen**: Analyzes the "loss asymmetry effect" by showing the required percentage gain to recover from a given account drawdown. Includes a progress bar visualization.
4. **Target Average Screen**: Calculates how many shares to buy at the Current Market Price (CMP) to achieve a specific target average price.
5. **Portfolio Screen**: (To be implemented) A simplified tracker for saved stock positions.
6. **Settings Screen**: Control app-wide constants: Currency symbol, Decimal precision, and Theme (Dark/Black/Light).

## 4. Implementation Steps

1. **Setup**: Initialize Android Project, add dependencies (Room, DataStore, Navigation, Hilt).
2. **Theme**: Define `Color.kt`, `Type.kt`, and `Theme.kt` based on the React Native palette.
3. **Storage**: Implement Room Database and DataStore repository.
4. **Shared Components**: Build `NumericInput`, `StatCard`, and `SectionCard`.
5. **Navigation**: Set up the `NavHost` and Bottom Navigation.
6. **Screen Development**: Implement each screen one-by-one with its corresponding `ViewModel`.
7. **Refinement**: Add haptics, copy-to-clipboard functionality, and polish animations.

## 5. Mapping React Native to Android Native
| Feature | React Native (Current) | Native Android (Proposed) |
| :--- | :--- | :--- |
| **UI** | React Native Components | Jetpack Compose |
| **State Management** | React `useState`, Context API | Compose State, ViewModels, Flow |
| **Storage** | AsyncStorage | DataStore / Room |
| **Navigation** | React Navigation | Compose Navigation |
| **Haptics** | `expo-haptics` | `Vibrator` API |
| **Clipboard** | `expo-clipboard` | `ClipboardManager` |
