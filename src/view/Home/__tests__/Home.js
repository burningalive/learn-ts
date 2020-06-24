import React from 'react';
import RsfApp from '@tencent/rsf';
import { ConfigRouters } from '@tencent/rsf';
import { MemoryRouter as Router } from 'react-router-dom';
import { mount, render } from 'enzyme';
import MainLayout from '$view/layout/Main';
import Home from '$view/Home';
import routesConfig from '$src/routes.config';
import mutations from '$src/mutations';

describe('src/view/Home', () => {
  function TestComponent() {
    return (
      <RsfApp
        mutations={mutations}
        initialState={{
          $loading: {
            '/globalData': false,
          },
        }}
      >
        <Router initialEntries={['/']}>
          <MainLayout>
            <ConfigRouters routes={routesConfig} />
          </MainLayout>
        </Router>
      </RsfApp>
    );
  }

  it('equals snapshots', () => {
    const html = render(<TestComponent />);
    expect(html).toMatchSnapshot();
  });

  it('has Home component`', () => {
    const wrapper = mount(<TestComponent />);
    expect(wrapper.find(Home)).toHaveLength(1);
  });

  it('Home component content`', () => {
    const wrapper = mount(<TestComponent />);
    expect(wrapper.find(Home).text()).toEqual('这里展示首页');
  });
});
