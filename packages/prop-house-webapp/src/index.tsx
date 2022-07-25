import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './state/store';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import './i18n.js';

import { Helmet } from 'react-helmet';

dayjs.extend(relativeTime);

ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode>
      <Provider store={store}>
        <Helmet>
          <title>CDT</title>
          <meta name="description" content="CDT App Description" />
        </Helmet>

        <App />
      </Provider>
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
