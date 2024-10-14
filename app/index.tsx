import React from 'react';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import Home from '@/components/community-pass';


const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'tomato',
        secondary: 'orange',
    },
};




function App(): React.JSX.Element {
    return <PaperProvider theme={theme}>
        <Home />
    </PaperProvider>;

}

export default App;
