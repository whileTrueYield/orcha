import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { ApolloProvider } from "@apollo/client";
import { GQLClient } from "utils/GQLClient";
import { Notifications } from "components/notification/Notifications";
import { VersionCheck } from "components/notification/VersionCheck";
import { BrowserRouter } from "react-router-dom";
import { MainRouter } from "Router";
import { MeLoader } from "pages/auth/MeLoader";
import { UploadManager } from "upload/UploadManager";

function App() {
  return (
    <ApolloProvider client={GQLClient}>
      <Provider store={store}>
        <UploadManager />
        <VersionCheck />
        <MeLoader />
        <BrowserRouter>
          <MainRouter />
        </BrowserRouter>
        <Notifications />
      </Provider>
    </ApolloProvider>
  );
}

export default App;
