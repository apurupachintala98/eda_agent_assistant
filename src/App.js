import React from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import config from './config.json';  

function App() {
    return (
        <div>
            <Dashboard
                logo={require(`${config.images.logo}`)}
                themeColor={config.themeColor}
                title={config.title}
                newChatButtonLabel={config.newChatButtonLabel}
                apiPath={config.apiPaths.getResponse}
                sqlUrl={config.apiPaths.sqlUrl}
                feedback={config.apiPaths.feedback}
                aplctn_cd={config.aplctn_cd}
                user_id={config.user_id}
                chatbotImage={require(`${config.images.chatbot}`)}
                suggestedPrompts={config.suggestedPrompts}
                userImage={require(`${config.images.user}`)}
                chatInitialMessage={config.chatInitialMessage}
                customStyles={config.customStyles}
            />
        </div>
    );
}

export default App;
