import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Main from './pages/Main';
import Repository from './pages/Repository';

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Main} />
        <Route path="/repository/:repository" component={Repository} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
