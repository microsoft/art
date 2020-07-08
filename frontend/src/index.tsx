import './main.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { Customizer, mergeStyles } from 'office-ui-fabric-react';
import { BreakpointsProvider } from 'react-with-breakpoints';
import * as serviceWorker from './serviceWorker';

// Inject some global styles
mergeStyles({
  selectors: {
    ':global(body), :global(html), :global(#root)': {
      margin: 0,
      padding: 0,
      height: '100vh'
    }
  }
});

ReactDOM.render(
  <BreakpointsProvider>
    <Customizer {...FluentCustomizations}>
      <App />
    </Customizer>
  </BreakpointsProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
