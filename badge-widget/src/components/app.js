import { h } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

import Home from '../routes/home';
import Profile from '../routes/profile';
import BadgeWidget from './BadgeWidget';

const App = () => (
	<div id="app">
		<BadgeWidget/>
	</div>
);

export default App;
